import glob
import json
import os
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SOURCE = os.path.join(HERE, "source")
DATA = os.path.join(ROOT, "src", "features", "recipes", "data")
SEED = os.path.join(ROOT, "supabase", "seed.sql")

CATEGORIES = {"cafe-da-manha", "lanche", "prato-principal", "acompanhamento", "sopa", "salada", "sobremesa", "bebida"}
DIFFICULTIES = {"facil", "media", "dificil"}

errors = []

catalog = json.load(open(os.path.join(SOURCE, "ingredients.json"), encoding="utf-8"))
for dup, n in Counter(i["id"] for i in catalog).items():
    if n > 1:
        errors.append(f"ingrediente duplicado no catálogo: {dup}")
by_id = {i["id"]: i for i in catalog}
always = {i["id"] for i in catalog if i["alwaysHave"]}

raw = []
for path in sorted(glob.glob(os.path.join(SOURCE, "[0-9]*.json"))):
    try:
        raw.extend(json.load(open(path, encoding="utf-8")))
    except json.JSONDecodeError as e:
        errors.append(f"{os.path.basename(path)}: JSON inválido ({e})")

for dup, n in Counter(r["id"] for r in raw).items():
    if n > 1:
        errors.append(f"receita duplicada: {dup}")

recipes = []
used = Counter()
for r in raw:
    rid = r.get("id", "?")
    for field in ("id", "title", "category", "prepTimeMinutes", "servings", "difficulty", "ingredients", "steps"):
        if field not in r:
            errors.append(f"{rid}: falta o campo {field}")
    if r.get("category") not in CATEGORIES:
        errors.append(f"{rid}: categoria inválida {r.get('category')}")
    if r.get("difficulty") not in DIFFICULTIES:
        errors.append(f"{rid}: dificuldade inválida {r.get('difficulty')}")

    for dup, n in Counter(i["id"] for i in r["ingredients"]).items():
        if n > 1:
            errors.append(f"{rid}: ingrediente repetido {dup}")
    for i in r["ingredients"]:
        if i["id"] not in by_id:
            errors.append(f"{rid}: ingrediente fora do catálogo: {i['id']}")
        if not i.get("text"):
            errors.append(f"{rid}: ingrediente {i['id']} sem texto")
        used[i["id"]] += 1

    steps = []
    for n, s in enumerate(r["steps"], start=1):
        step = {"order": n, "text": s["text"]}
        t = s.get("timer")
        if t is not None:
            if not isinstance(t, int) or t <= 0:
                errors.append(f"{rid}: timer inválido no passo {n}")
            step["timerSeconds"] = t
        steps.append(step)

    key = [i["id"] for i in r["ingredients"] if not i.get("optional") and i["id"] not in always]
    if not key:
        errors.append(f"{rid}: nenhum ingrediente principal (só básicos ou opcionais)")

    recipes.append({
        "id": rid,
        "title": r["title"],
        "category": r["category"],
        "prepTimeMinutes": r["prepTimeMinutes"],
        "servings": r["servings"],
        "difficulty": r["difficulty"],
        "image": None,
        "ingredients": [
            {"id": i["id"], "name": by_id.get(i["id"], {}).get("name", i["id"]), "text": i["text"], "optional": bool(i.get("optional"))}
            for i in r["ingredients"]
        ],
        "steps": steps,
        "keyIngredients": key,
    })

if errors:
    print("ERROS:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

recipes.sort(key=lambda r: (r["category"], r["title"]))
os.makedirs(DATA, exist_ok=True)
with open(os.path.join(DATA, "recipes.json"), "w", encoding="utf-8") as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)
    f.write("\n")
with open(os.path.join(DATA, "ingredients.json"), "w", encoding="utf-8") as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)
    f.write("\n")


def lit(s):
    return "NULL" if s is None else "'" + str(s).replace("'", "''") + "'"


def arr(xs):
    return "ARRAY[" + ",".join(lit(x) for x in xs) + "]::text[]"


def js(v):
    return lit(json.dumps(v, ensure_ascii=False)) + "::jsonb"


sql = ["""drop function if exists search_recipes(text[], int);
drop table if exists recipes;
drop table if exists ingredients;

create table ingredients (
  id text primary key,
  name text not null,
  category text not null,
  always_have boolean not null default false
);

create table recipes (
  id text primary key,
  title text not null,
  category text not null,
  prep_time_minutes int not null,
  servings int not null,
  difficulty text not null,
  image text,
  ingredients jsonb not null,
  steps jsonb not null,
  key_ingredients text[] not null
);

create index recipes_key_ingredients_idx on recipes using gin (key_ingredients);

alter table ingredients enable row level security;
alter table recipes enable row level security;
create policy "public read" on ingredients for select using (true);
create policy "public read" on recipes for select using (true);

grant usage on schema public to anon, authenticated;
grant select on ingredients, recipes to anon, authenticated;
"""]

sql.append("insert into ingredients (id, name, category, always_have) values")
sql.append(",\n".join(
    f"  ({lit(i['id'])}, {lit(i['name'])}, {lit(i['category'])}, {'true' if i['alwaysHave'] else 'false'})" for i in catalog
) + ";\n")

sql.append("insert into recipes (id, title, category, prep_time_minutes, servings, difficulty, image, ingredients, steps, key_ingredients) values")
sql.append(",\n".join(
    f"  ({lit(r['id'])}, {lit(r['title'])}, {lit(r['category'])}, {r['prepTimeMinutes']}, {r['servings']}, {lit(r['difficulty'])}, NULL, "
    f"{js(r['ingredients'])}, {js(r['steps'])}, {arr(r['keyIngredients'])})"
    for r in recipes
) + ";\n")

sql.append("""create or replace function search_recipes(pantry text[], max_missing int default 2)
returns table (recipe jsonb, used text[], missing text[])
language sql stable as $$
  select jsonb_build_object(
           'id', r.id, 'title', r.title, 'category', r.category,
           'prepTimeMinutes', r.prep_time_minutes, 'servings', r.servings, 'difficulty', r.difficulty,
           'image', r.image, 'ingredients', r.ingredients, 'steps', r.steps,
           'keyIngredients', to_jsonb(r.key_ingredients)),
         c.used,
         c.missing
  from recipes r
  cross join lateral (
    select array(select x from unnest(r.key_ingredients) x where x = any(pantry)) as used,
           array(select x from unnest(r.key_ingredients) x where not (x = any(pantry))) as missing
  ) c
  where r.key_ingredients && pantry
    and cardinality(c.missing) <= max_missing
  order by cardinality(c.missing), random();
$$;

revoke execute on function search_recipes(text[], int) from public;
grant execute on function search_recipes(text[], int) to anon, authenticated;
""")

os.makedirs(os.path.dirname(SEED), exist_ok=True)
with open(SEED, "w", encoding="utf-8") as f:
    f.write("\n".join(sql))

unused = [i["id"] for i in catalog if i["id"] not in used and i["id"] not in always]
print(f"OK: {len(recipes)} receitas, {len(catalog)} ingredientes")
if unused:
    print("Ingredientes sem nenhuma receita:", ", ".join(unused))
