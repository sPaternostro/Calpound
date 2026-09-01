import { useState } from 'react';
import { View } from 'react-native';

import { AppText, HelpText, Title } from '@/components/ui/AppText';
import { Button, Card } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { formatDayLabel, formatKcal } from '@/lib/dates';
import { useAppStore } from '@/lib/store';

export default function BankScreen() {
  const savings = useAppStore((s) => s.savings);
  const spendSavings = useAppStore((s) => s.spendSavings);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

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
