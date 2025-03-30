const pup = require("puppeteer");
const venom = require("venom-bot");

const url = "https://app.quantosobra.com.br/";

(async () => {
  try {
  
    const browser = await pup.launch({
      headless: false,
      args: ["--window-size=1366,768"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log("Iniciando scraping...");

  
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[name="login"]');
    await page.type('input[name="login"]', "thalisantunes@hotmail.com", { delay: 50 });
    await page.type('input[name="pass"]', "Cardial2024@", { delay: 50 });
    await page.click("#logar");
    console.log("Login realizado");

   
    await new Promise(resolve => setTimeout(resolve, 5000)); 
    await page.click("a[href='cadastros']");
    await new Promise(resolve => setTimeout(resolve, 5000)); 
    await page.click('td[class="cpf_cnpj"]');
    await new Promise(resolve => setTimeout(resolve, 5000)); 


    const { nome, telefone } = await page.evaluate(() => {
      const nomeElement = document.querySelector('span.nome');
      const telefoneElement = document.querySelector('.listContatos li');
      
      let telefone = "Não encontrado";
      if (telefoneElement) {
        const telefoneMatch = telefoneElement.innerText.match(/Telefone:\s*([\d()\s-]+)/);
        telefone = telefoneMatch ? telefoneMatch[1].trim().replace(/\D/g, '') : "Não encontrado";
      }

      return {
        nome: nomeElement ? nomeElement.innerText.trim() : "Não encontrado",
        telefone: telefone
      };
    });

    console.log("Dados obtidos:", { nome, telefone });

    await browser.close();

   
    if (nome !== "Não encontrado" && telefone !== "Não encontrado") {
     
      venom
        .create({
          session: "session-name",
          headless: true,
          browserArgs: ["--headless=new"],
        })
        .then((client) => {
          console.log("WhatsApp conectado!");
          sendMessage(client, telefone, nome);
        })
        .catch((error) => console.log("Erro ao iniciar Venom:", error));
    } else {
      console.log("Dados insuficientes para enviar mensagem");
    }
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
})();


function sendMessage(client, telefone, nome) {

  const numeroFormatado = `${telefone}@c.us`;
  
  const mensagem = `Olá ${nome}! Faz tempo que você não vem na loja, visite-nos assim que possível!`;

  client
    .sendText(numeroFormatado, mensagem)
    .then((result) => {
      console.log("Mensagem enviada com sucesso para:", telefone);
      console.log("Resultado:", result);
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem para:", telefone);
      console.error("Detalhes:", error);
    });
}