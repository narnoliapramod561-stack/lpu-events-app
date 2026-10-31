import { InfoPage } from '../src/components/InfoPage';
import { useTheme } from '../src/theme/ThemeContext';
export default function ContactScreen() { const { dark } = useTheme(); return <InfoPage kind="contact" dark={dark} />; }
