// for future use, not used today...
export class Choice {
   key: string;
   stepKey: string | undefined;
   url: URL | undefined;
}

export class HowToStep {
   public stepKey: string;
   public question: string;
   public choices: Choice[];

   public constructor(init?:Partial<Choice>) {
       Object.assign(this, init);
   }
}
