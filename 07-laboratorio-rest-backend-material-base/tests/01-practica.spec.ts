// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import {test, expect} from '@playwright/test'
test.describe('Escenario 2', ()=>{

    test('Anatomía de una petición y una respuesta',async({request})=>{
        const respuesta = await request.get('tasks?completed=false&page=1&limit=10',{
            headers:{
                'Accept':'application/json'
            }
        })
        await expect(respuesta.status()).toBe(200)
    })
})