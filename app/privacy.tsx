import { InfoPage } from '../src/components/InfoPage';
import { useTheme } from '../src/theme/ThemeContext';
export default function PrivacyScreen() { const { dark } = useTheme(); return <InfoPage kind="privacy" dark={dark} />; }
