import { PaletteError } from '../utils/errors';
import { Colors, Icons, TIcon } from './Styles';

/**
 * Represents the available style keys from the colors or icons object.
 *
 * @example
 * 'red', 'bold', 'icon.success'
 */
export type TStyles = keyof typeof Colors | `icon.${TIcon}`;

/**
 * A function that formats input into a styled string.
 *
 * @param {...unknown[]} args - Inputs to be styled
 * @returns {string} - The styled string.
 * @internal
 */
export type ColorFunction = (...args: unknown[]) => string;

/**
 * Represents a Chain palette interface.
 * Each Style Key Returns a New Chain With It's Styles Applied.
 */
export type TChain = {
        [K in keyof typeof Colors]: TChain & ColorFunction;
} & ColorFunction & {
                icons: {
                        [K in TIcon]: TChain & ColorFunction;
                };

                /**
                 * Formats The Input With All The Styles Applied.
                 * @see {@link ColorFunction}
                 *
                 * @param {...unknown[]} args - Input
                 * @returns {string} - Styled Output
                 */
                format: ColorFunction;

                /**
                 * Alias to `.format(...)`, Allows Functional Usage of The Chain.
                 * @alias {@link Palette.format}
                 * @see {@link ColorFunction}
                 *
                 * @param {...unknown[]} args - Input
                 * @returns {string} - Styled Output
                 */
                call: ColorFunction;
        };

export class Palette {
        /**
         * List of Applied Styles.
         * @see {@link TStyles}
         */
        public styles: TStyles[];

        /**
         * @param {TStyles[]} [style=[]] - List of Styles to Apply
         */
        public constructor(style: TStyles[] = []) {
                this.styles = style;
        }

        /**
         * Formats The Input Using The Applied Styles.
         *
         * @param {...unknown} args - Input to Style
         * @returns {string} - Styled Output
         */
        public format(...args: unknown[]) {
                const text = args
                        .map((x) => {
                                if (x instanceof Error) {
                                        return x.stack || x.message;
                                }

                                if (typeof x === 'object') {
                                        return JSON.stringify(x, null, 2);
                                }

                                return String(x);
                        })
                        .join(' ');

                return `${this.styles.join('')} ${text}${Colors.reset}`;
        }

        /**
         * Alias to `.format(...)`, Allows `.call(...)` Usage in Chains.
         *
         * @param {...unknown[]} args - Input
         * @returns {string} - Styled Output
         */
        public call(...args: unknown[]) {
                return this.format(...args);
        }

        public static create(style: TStyles[] = []): TChain {
                return new Proxy(() => {}, ProxyHandler(style)) as TChain;
        }
}

/**
 * A dynamic proxy handler used to build a style chain or invoke formatting.
 *
 * Supports `.icons.<name>`, `.format()`, and chaining of style keys.
 *
 * @param {TStyles[]} style - Current style stack.
 * @returns {ProxyHandler<object>} - The handler object for the palette proxy.
 * @internal
 */
export function ProxyHandler(style: TStyles[]): ProxyHandler<object> {
        const palette = new Palette(style);

        return {
                get: (_, prop: string) => {
                        if (prop in Colors) {
                                return Palette.create([...style, Colors[prop as never]]);
                        }

                        if (prop === 'format') return palette.format.bind(palette);
                        if (prop === 'call') return palette.call;

                        if (prop === 'icons') {
                                return new Proxy(() => {}, {
                                        get: (_, IconName: string) => {
                                                if (!(IconName in Icons)) throw new PaletteError('ICON_NOT_FOUND', IconName, Object.keys(Icons).join(', '));
                                                const IconValue = Icons[IconName as TIcon] as TStyles;
                                                return Palette.create([...style, IconValue]);
                                        }
                                });
                        }

                        return () => {
                                throw new PaletteError('UNKNOWN_METHOD', prop);
                        };
                },

                apply: (_, __, argArray) => {
                        return palette.call(...argArray);
                }
        };
}

/**
 * Palette, chain colors & icons!
 *
 * @example
 * palette.red("This is in Red!");
 * palette.bold("This is a bolded message!");
 * palette.red.bold("Both, red & bold");
 */
export const palette = Palette.create();
