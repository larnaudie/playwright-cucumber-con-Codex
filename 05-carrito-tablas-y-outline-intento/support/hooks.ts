import {
  BeforeAll,
  Before,
  After,
  AfterAll,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { chromium, type Browser } from "@playwright/test";
import { CustomWorld } from "./world";
import { readFile } from "node:fs/promises";
import { environment } from "../config/environment";

let browser: Browser;
setDefaultTimeout(process.env.PWDEBUG ? -1 : 15_000);

BeforeAll(async function () {
  // En paralelo cada worker tiene su propio proceso y su propio browser.
  browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
});

Before(async function (this: CustomWorld) {
  // Contexto nuevo por escenario: cookies y localStorage independientes.
  this.context = await browser.newContext({
    recordVideo: {
      dir: "reports/videos/",
      size: { width: 1280, height: 720 },
    },
    viewport: {
      width: 1280,
      height: 720,
    },
  });
  this.page = await this.context.newPage();

  //Esto se agregará para inicializar los Page Objects que necesitemos en el escenario.
  // Inicializaremos los Page Objects durante el ejercicio.
  this.inicializatePage();
  await this.currentPage.goto(environment.baseURL)
});

After(async function (this: CustomWorld, { result }) {
  const fallo = result?.status === Status.FAILED;
  const video = this.page?.video();

  try {
    if (fallo && this.page && !this.page.isClosed()) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        await this.attach(screenshot, "image/png");
      } catch (error) {
        await this.attach(
          "No se pudo capturar evidencia: " + String(error),
          "text/plain",
        );
      }
    }
  } finally {
    await this.context?.close();
  }
  if (video) {
    if (fallo) {
      const ruta = await video.path();
      const contenido = await readFile(ruta);
      console.log(`Video del fallo ${ruta}`);
      await this.attach(contenido, {
        mediaType: "video/webm",
        fileName: "video-del-fallo.webm",
      });
    } else {
      await video.delete();
    }
  }
});

AfterAll(async function () {
  await browser?.close();
});
