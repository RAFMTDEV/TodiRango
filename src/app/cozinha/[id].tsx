import { activateKeepAwakeAsync, deactivateKeepAwake, isAvailableAsync } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cancelTimerAlert, scheduleTimerAlert } from '../../features/cooking/notifications';
import { formatTime, useTimer } from '../../features/cooking/useTimer';
import { getRecipeById } from '../../features/recipes/service';
import { Recipe } from '../../types';
import { Button } from '../../ui/Button';
import { colors, radius } from '../../ui/theme';

const KEEP_AWAKE_TAG = 'modo-cozinha';

function useScreenAwake() {
  useEffect(() => {
    let active = false;
    isAvailableAsync()
      .then((ok) => {
        if (!ok) return;
        active = true;
        return activateKeepAwakeAsync(KEEP_AWAKE_TAG);
      })
      .catch(() => {});

    return () => {
      if (active) deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, []);
}

function StepTimer({ seconds, recipeTitle }: { seconds: number; recipeTitle: string }) {
  const alertId = useRef<string | null>(null);
  const session = useRef(0);

  const timer = useTimer(seconds, () => {
    Vibration.vibrate([0, 500, 300, 500]);
    alertId.current = null;
  });

  const dropAlert = () => {
    session.current += 1;
    cancelTimerAlert(alertId.current);
    alertId.current = null;
  };

  useEffect(
    () => () => {
      session.current += 1;
      cancelTimerAlert(alertId.current);
    },
    [],
  );

  const start = () => {
    timer.start();
    const current = ++session.current;
    scheduleTimerAlert(timer.remaining, `O passo de ${recipeTitle} terminou.`).then((id) => {
      if (session.current === current) alertId.current = id;
      else cancelTimerAlert(id);
    });
  };

  const pause = () => {
    timer.pause();
    dropAlert();
  };

  const reset = () => {
    timer.reset();
    dropAlert();
  };

  return (
    <View
      style={{
        backgroundColor: timer.finished ? colors.orange : '#26332D',
        borderRadius: radius.card,
        padding: 20,
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Text
        style={{
          fontSize: 56,
          fontWeight: '800',
          color: timer.finished ? colors.ink : colors.bg,
          fontVariant: ['tabular-nums'],
        }}
        accessibilityLabel={`Cronômetro: ${formatTime(timer.remaining)}`}
      >
        {formatTime(timer.remaining)}
      </Text>

      {timer.finished && (
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>Tempo esgotado!</Text>
      )}

      <View style={{ flexDirection: 'row', gap: 12, alignSelf: 'stretch' }}>
        {!timer.finished && (
          <View style={{ flex: 1 }}>
            <Button
              label={timer.running ? 'Pausar' : timer.remaining < seconds ? 'Continuar' : 'Iniciar'}
              onPress={timer.running ? pause : start}
            />
          </View>
        )}
        {(timer.remaining < seconds || timer.finished) && (
          <View style={{ flex: 1 }}>
            <Button label="Recomeçar" variant="outline" onPress={reset} />
          </View>
        )}
      </View>
    </View>
  );
}

export default function Cozinha() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [step, setStep] = useState(0);

  useScreenAwake();

  useEffect(() => {
    getRecipeById(id).then(setRecipe);
  }, [id]);

  if (!recipe) return null;

  const current = recipe.steps[step];
  const total = recipe.steps.length;
  const isFirst = step === 0;
  const isLast = step === total - 1;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.dark,
        padding: 24,
        paddingBottom: 24 + insets.bottom,
        gap: 20,
      }}
    >
      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.orange, fontWeight: '700', fontSize: 16 }}>
          Passo {step + 1} de {total}
        </Text>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: '#3A4741' }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              width: `${((step + 1) / total) * 100}%`,
              backgroundColor: colors.orange,
            }}
          />
        </View>
      </View>

      <Text style={{ color: colors.bg, fontSize: 26, lineHeight: 36, fontWeight: '800' }}>
        {current.text}
      </Text>

      {current.timerSeconds ? (
        <StepTimer key={step} seconds={current.timerSeconds} recipeTitle={recipe.title} />
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {!isFirst && (
          <View style={{ flex: 1 }}>
            <Button label="Voltar" variant="outline" onPress={() => setStep(step - 1)} />
          </View>
        )}
        <View style={{ flex: isFirst ? 1 : 2 }}>
          <Button
            label={isLast ? 'Concluir' : 'Próximo passo'}
            onPress={() => (isLast ? router.back() : setStep(step + 1))}
          />
        </View>
      </View>
    </View>
  );
}
