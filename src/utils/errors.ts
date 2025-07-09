import { makeKordJSError } from '@kordjs/utils';
import { Colors } from '../lib/Styles';

const { reset, yellow, white, bold, underline } = Colors;

const defaultErrors = {};

export const PaletteError = makeKordJSError(
        Error as new (...args: unknown[]) => Error,
        'PaletteError',
        {
                ...defaultErrors,
                ICON_NOT_FOUND: (icon: string, icons: string) => `No icons found with name: ${yellow}${icon}${reset} | (${underline}icons${reset}: ${icons})`,
                UNKNOWN_METHOD: (method: string) => `Unknown method called: ${yellow}${method}${reset}`
        },
        (base, code) => {
                return `${white}${bold}${base}${reset} - ${yellow}${underline}[${code}]${reset}`;
        }
);
