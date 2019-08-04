export interface AddressSearchInterface {
    reset(): void;
    setError(error: string): void;
    resetErrors(): void;
    FocusElement(): void;
    IsBusy(): boolean;
}
