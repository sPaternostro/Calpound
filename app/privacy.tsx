import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { PRIVACY_VERSION } from '@/lib/legal';

export default function PrivacyScreen() {
  return (
    <Screen safeTop={false}>
      <AppText tone="muted" className="mb-4 text-sm">
        Versión {PRIVACY_VERSION}
      </AppText>
      <AppText className="mb-3 leading-6">
        Calpound es una app de organización de calorías. No es un servicio médico ni un
        profesional de la salud.
      </AppText>
      <AppText className="mb-3 font-semibold">Qué datos quedan en tu dispositivo</AppText>
      <AppText className="mb-3 leading-6">
        El perfil, las comidas, el movimiento, el banco y los logros se guardan solo en este
        teléfono. No hay cuenta, no hay servidor nuestro y no vendemos datos.
      </AppText>
      <AppText className="mb-3 font-semibold">Cámara</AppText>
      <AppText className="mb-3 leading-6">
        Si escaneás un código de barras, usamos la cámara en ese momento para leer el código. No
        guardamos fotos.
      </AppText>
      <AppText className="mb-3 font-semibold">Open Food Facts</AppText>
      <AppText className="mb-3 leading-6">
        Si buscás o escaneás un producto, consultamos la base abierta Open Food Facts para
        sugerir calorías. Ellos reciben la búsqueda o el código, no tu nombre ni tu peso.
      </AppText>
      <AppText className="mb-3 font-semibold">Borrar todo</AppText>
      <AppText className="leading-6">
        En Ajustes podés borrar el perfil y el historial de este dispositivo. Eso no se puede
        deshacer.
      </AppText>
    </Screen>
  );
}
