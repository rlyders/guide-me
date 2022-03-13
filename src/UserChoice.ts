export class UserChoice {
    public path: string;
    public stepKey: string;
    public selectedChoiceValue: string | undefined;
    public selectedChoiceKey: string | undefined;
    public url: URL | undefined;

    public constructor(init?:Partial<UserChoice>) {
        Object.assign(this, init);
    }
}
