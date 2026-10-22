// Lo construiremos juntos: por ahora no hay step definitions.
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import {expect} from '@playwright/test'

Given('que abro el portal', async function (this: CustomWorld) {
    await this.getCurrentPage().goto('http://127.0.0.1:3100/');
})

When ('ingreso con el correo {string} y la contraseña {string}',
    async function (this: CustomWorld, email: string, password: string){
        await this.currentPage?.getByRole('textbox', { name: 'Correo electrónico' })
        .fill(email);
        await this.currentPage?.getByRole('textbox', { name: 'Contraseña' })
        .fill(password);
        await this.currentPage?.getByRole('button', { name: 'Iniciar sesión' }).click();
})

Then ('veo el saludo {string}', async function (this: CustomWorld, saludo: string){
   await expect(this.getCurrentPage().getByText(saludo)).not.toBeChecked()
})<