const pup = require("puppeteer");
const venom = require("venom-bot");

const url = "https://app.quantosobra.com.br/";

(async () => {
  try {
    // Configuração do Puppeteer
    const browser = await pup.launch({
      headless: false,
      args: ["--window-size=1366,768"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log("Iniciando scraping...");

    // Navegação e login
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.type('input[name="login"]', "thalisantunes@hotmail.com", {
      delay: 50,
    });
    await page.type('input[name="pass"]', "Cardial2024@", { delay: 50 });
    await page.click("#logar");
    console.log("Login realizado");

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.click("a[href='cadastros']");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const registros = await page.$$("#tbl_cadastro tbody tr");
    console.log(`Encontrados ${registros.length} registros`);

    // Inicia o Venom-Bot uma única vez
    const client = await venom.create({
      session: "session-name",
      headless: true,
      browserArgs: ["--headless=new"],
    });
    console.log("WhatsApp conectado!");

    // Processa cada registro
    for (let i = 0; i < registros.length; i++) {
      try {
        console.log(`Processando registro ${i + 1} de ${registros.length}`);

        const registroAtual = (await page.$$("#tbl_cadastro tbody tr"))[i];

        await registroAtual.click();
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const { nome, telefone } = await page.evaluate(() => {
          const nomeElement = document.querySelector("span.nome");
          const telefoneElement = document.querySelector(".listContatos li");

          let telefone = "Não encontrado";
          if (telefoneElement) {
            const telefoneMatch = telefoneElement.innerText.match(
              /Telefone:\s*([\d()\s-]+)/
            );
            telefone = telefoneMatch
              ? telefoneMatch[1].trim().replace(/\D/g, "")
              : "Não encontrado";
          }

          return {
            nome: nomeElement ? nomeElement.innerText.trim() : "Não encontrado",
            telefone: telefone,
          };
        });

        console.log(`Dados do registro ${i + 1}:`, { nome, telefone });

        await page.keyboard.press("Escape");
        await new Promise(resolve => setTimeout(resolve, 5000)); 

        if (nome !== "Não encontrado" && telefone !== "Não encontrado") {
          await sendMessage(client, telefone, nome);
          await new Promise(resolve => setTimeout(resolve, 5000)); 
        } else {
          console.log(`Dados insuficientes no registro ${i + 1}`);
        }
      } catch (error) {
        console.error(`Erro ao processar registro ${i + 1}:`, error);

        continue;
      }
    }

    await browser.close();
    console.log("Processamento concluído");
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
})();

async function sendMessage(client, telefone, nome) {
  const numeroFormatado = `${telefone}@c.us`;

  const mensagem = `Olá ${nome}! Faz tempo que você não vem na loja, visite-nos assim que possível!`;

  try {
    const result = await client.sendText(numeroFormatado, mensagem);
    console.log("Mensagem enviada com sucesso para:", telefone);
    console.log("Resultado:", result);
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem para:", telefone);
    console.error("Detalhes:", error);
    return false;
  }
}
