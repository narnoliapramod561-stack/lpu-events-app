import { InfoPage } from '../src/components/InfoPage';
import { useTheme } from '../src/theme/ThemeContext';
export default function TermsScreen() { const { dark } = useTheme(); return <InfoPage kind="terms" dark={dark} />; }
