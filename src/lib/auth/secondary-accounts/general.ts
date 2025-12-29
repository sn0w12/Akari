import type { SecondaryAccount } from "../secondary-accounts";

export abstract class SecondaryAccountBase implements SecondaryAccount {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly color: string;

    get textColor(): string {
        return this.calculateTextColor(this.color);
    }

    private calculateTextColor(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    }

    abstract getAuthUrl(): string;
    abstract logOut(): Promise<boolean>;
    abstract validate(): Promise<boolean>;
    abstract sync(
        manga: components["schemas"]["ChapterResponse"]
    ): Promise<boolean>;
    abstract handleCallback(
        params: Record<string, string>,
        hash: string,
        origin: string
    ): Promise<boolean>;
}
