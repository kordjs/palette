import { PaletteError } from '../utils/errors';
import { Colors, Icons, TIcon } from './Styles';

/**
 * Type representing the style keys available.
 */
export type TStyles = keyof typeof Colors | `icon.${Capitalize<TIcon>}`;

export type ColorFunction = (...args: unknown[]) => string;

export type TChain = {
        [K in keyof typeof Colors]: TChain & ColorFunction;
} & ColorFunction & {
                icons: {
                        [K in TIcon]: TChain & ColorFunction;
                };

                format: ColorFunction;
                call: ColorFunction;
        };

export class Palette {
        public styles: TStyles[];

        public constructor(style: TStyles[] = []) {
                this.styles = style;
        }

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

        public call(...args: unknown[]) {
                return this.format(...args);
        }

        public static create(style: TStyles[] = []): TChain {
                return new Proxy(() => {}, ProxyHandler(style)) as TChain;
        }
}

function ProxyHandler(style: TStyles[]): ProxyHandler<object> {
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

export const palette = Palette.create();
