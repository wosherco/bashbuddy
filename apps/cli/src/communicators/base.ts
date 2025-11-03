export abstract class BaseCommunicator {
  abstract sendMessage(message: string): Promise<void>;
  abstract receiveMessage(): Promise<string>;
}
