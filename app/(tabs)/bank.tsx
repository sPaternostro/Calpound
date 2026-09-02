import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { formatDayLabel, formatKcal } from '@/lib/dates';
import { useAppStore } from '@/lib/store';

export default function BankScreen() {
  const savings = useAppStore((s) => s.savings);
  const spendSavings = useAppStore((s) => s.spendSavings);
  const profile = useAppStore((s) => s.profile);
  const addFood = useAppStore((s) => s.addFood);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [logged, setLogged] = useState<string | null>(null);

  const guiltFree = (profile?.guiltFreeFoods ?? []).filter(
    (item) => item.name.trim() && item.calories > 0,
  );

  const onSpend = () => {
    const result = spendSavings(Number(amount), note);
    setMessage(result.message);
    if (result.ok) {
      setAmount('');
      setNote('');
    }
  };

  return (
    <Screen>
      <Title>Banco</Title>
      <HelpText>
        Acá se junta lo que ahorraste (o sumaste) en los días que quedaron dentro del rango. Podés
        “gastarlo” en una comida especial, un extra o lo que elijas.
      </HelpText>

      {guiltFree.length > 0 ? (
        <View className="mt-5">
          <AppText className="mb-1 font-semibold">Registrar sin culpa</AppText>
          <HelpText>
            Siempre a mano, dentro del presupuesto de hoy. No hace falta saldo ni desbloquearlas.
          </HelpText>
          {guiltFree.map((item) => (
            <View
              key={item.name}
              className="mt-2 flex-row items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3">
              <View className="flex-1 pr-3">
                <AppText className="font-medium">{item.name}</AppText>
                <AppText tone="muted" className="text-xs">
                  {item.calories} kcal
                </AppText>
              </View>
              <Pressable
                onPress={() => {
                  addFood({ name: item.name, calories: item.calories, source: 'manual' });
                  setLogged(`${item.name} sumado al día`);
                }}
                className="rounded-full bg-forest px-3 py-2">
                <AppText tone="paper" className="text-xs font-semibold">
                  Registrar
                </AppText>
              </Pressable>
            </View>
          ))}
          {logged ? (
            <AppText tone="forest" className="mt-2 text-sm">
              {logged}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <Card className="mt-5">
        <AppText tone="muted">Saldo disponible</AppText>
        <AppText className="text-4xl font-semibold text-forest">
          {formatKcal(savings.totalSaved)}
        </AppText>
      </Card>

      <AppText className="mb-1 mt-6 font-semibold">Gastar</AppText>
      <Field
        label="Cantidad (kcal)"
        keyboardType="number-pad"
        value={amount}
        onChangeText={setAmount}
        help="Es un retiro de tu saldo, no un registro de comida. Si también la comés, cargala en Registrar comida."
      />
      <Field
        label="Nota"
        value={note}
        onChangeText={setNote}
        help="Ejemplo: “cena de cumpleaños” o “pizza del viernes”. Es solo para vos."
      />
      <Button label="Gastar del saldo" onPress={onSpend} disabled={!Number(amount)} />
      {message ? (
        <AppText className="mt-2" tone="forest">
          {message}
        </AppText>
      ) : null}

      <AppText className="mb-2 mt-8 font-semibold">Movimientos</AppText>
      {savings.history.length === 0 ? (
        <AppText tone="muted">Todavía no hay movimientos. Los días en rango van a ir sumando.</AppText>
      ) : (
        savings.history.map((item) => (
          <View
            key={item.id}
            className="mb-2 flex-row items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3">
            <View className="flex-1 pr-3">
              <AppText className="font-medium">
                {item.type === 'earned' ? 'Ingreso' : 'Gasto'}
              </AppText>
              <AppText tone="muted" className="text-xs">
                {formatDayLabel(item.date)}
                {item.note ? ` · ${item.note}` : ''}
              </AppText>
            </View>
            <AppText className={item.type === 'earned' ? 'text-forest' : 'text-bronze'}>
              {item.type === 'earned' ? '+' : '−'}
              {item.amount}
            </AppText>
          </View>
        ))
      )}
    </Screen>
  );
}
