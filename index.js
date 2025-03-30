
    const pup = require("puppeteer");

    const url = "https://app.quantosobra.com.br/";
    
    (async () => {
      try {
        const browser = await pup.launch({
          headless: false,
          args: ["--window-size=1366,768"],
        });
    
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
    
        console.log("Iniciei");
    
        await page.goto(url, { waitUntil: "domcontentloaded" });
        console.log("Página carregada");
    
        // Login
        await page.waitForSelector('input[name="login"]');
        await page.type('input[name="login"]', "thalisantunes@hotmail.com", { delay: 50 });
        await page.type('input[name="pass"]', "Cardial2024@", { delay: 50 });
        await page.click("#logar");
        console.log("Botão de login clicado");
    
      
    await new Promise(resolve => setTimeout(resolve, 5000)); 

        await page.click("a[href='cadastros']");
        
       
    await new Promise(resolve => setTimeout(resolve, 5000)); 

        await page.click('td[class="cpf_cnpj"]');
       
    await new Promise(resolve => setTimeout(resolve, 5000)); 

      
        const data = await page.evaluate(() => {
        
          const nomeElement = document.querySelector('span.nome');
          const nome = nomeElement ? nomeElement.innerText.trim() : "Não encontrado";
          
          
          const telefoneElement = document.querySelector('.listContatos li');
          let telefone = "Não encontrado";
          if (telefoneElement) {
            const telefoneMatch = telefoneElement.innerText.match(/Telefone:\s*([\d()\s-]+)/);
            telefone = telefoneMatch ? telefoneMatch[1].trim() : "Não encontrado";
          }
          
         
          let email = "Não encontrado";
          if (telefoneElement) {
            const emailMatch = telefoneElement.innerText.match(/E-mail:\s*([\w.-]+@[\w.-]+\.[a-zA-Z]+)/);
            email = emailMatch ? emailMatch[1].trim() : "Não encontrado";
          }
          
        
          const nascimentoElement = document.querySelector('span.nasc_fundacao');
          const nascimento = nascimentoElement ? nascimentoElement.innerText.trim() : "Não encontrado";
          
          
          const cpfElement = document.querySelector('span.cpf_cnpj');
          const cpf = cpfElement ? cpfElement.innerText.trim() : "Não encontrado";
    
          return {
            nome,
            telefone,
            email,
            nascimento,
            cpf
          };
        });
    
        console.log("Nome:", data.nome);
        console.log("Telefone:", data.telefone);
        console.log("E-mail:", data.email);
        console.log("Nascimento:", data.nascimento);
        console.log("CPF:", data.cpf);
    
        await page.waitForTimeout(5000);

        
        await browser.close();
      } catch (error) {
        console.error("Ocorreu um erro:", error);
      }
    })();