import { AbstractControl } from '@angular/forms';

export function ValidateInput(control: AbstractControl) {
    if (control.value === 'select') {
        return { invalid: true };
    }
    return null;
}
