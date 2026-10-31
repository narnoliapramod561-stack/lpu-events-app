import { InfoPage } from '../src/components/InfoPage';
import { useTheme } from '../src/theme/ThemeContext';
export default function AboutScreen() { const { dark } = useTheme(); return <InfoPage kind="about" dark={dark} />; }
