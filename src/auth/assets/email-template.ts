export class EmailTemplate {
  public getTemplate(firstname: string, redirectUrl: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
        <style>
          /* Adicionei estilos CSS para tornar o layout responsivo */
          @media only screen and (max-width: 600px) {
            /* Estilos para dispositivos com largura máxima de 600px */
            body {
              padding: 0;
              margin: 0;
            }
    
            main {
              align-items: flex-start;
            }
    
            div {
              margin-left: 0;
              margin-right: 0;
              max-width: 100%;
            }
    
            img.img2 {
              width: 100%;
              height: auto;
            }
    
            div:first-child {
              margin-bottom: 20px;
              margin-right: 0;
            }
    
            div:nth-child(2) {
              max-width: 100%;
              margin: 0;
            }
    
            div:last-child {
              margin-bottom: 20px;
            }
    
            button {
              padding: 0.1rem 0 0.1rem 0rem;
              max-width: 100%;
              font-size: 12px;
            }
    
            footer {
              max-width: 100%;
              margin-left: auto;
              margin-right: auto;
            }
            
            p {
              font-size: 1.5rem;
              line-height: 25px;
            }
            a{
              font-size: 1.5rem;
            }
          }
        </style>
      </head>
    
      <body style="padding: 0; font-family: 'Roboto', sans-serif; margin: 0;">
        <main style="display: block; margin: 0;">
          <div style="margin-left: auto; margin-right: auto; display: block;" width="100%">
            <img class="img2" src="https://drive.google.com/uc?export=view&amp;id=1dp-ow3vOcvcW1QlS4IEbnyvfcKNNSDE9" alt="segunda imagem interna"  width="1440px">
          </div>
    
          <div style="height: 70vh; margin: 0; display: block; width: 1440px;">
            <div style="font-size: 2.5rem; font-style: normal; line-height: 42px; color: #000; font-weight: 400; margin-left: auto; margin-right: auto; display: block; width: 80%;">
              <p>Olá, ${firstname},</p>
              <p>Para recuperar o seu login é necessário refazer a sua senha.</p>
              <p>Clique no link abaixo para continuar</p>
            </div>
    
            <div style="display: block; margin-left: auto; margin-right: auto; width: 95%;">
              <a href="${redirectUrl}" target="_blank" style="text-decoration: none;">
                <button style="padding: 0.5rem 2rem 0.5rem 2rem; background-color: #0079c7; border-radius: 5px; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; display: block; margin-left: auto; margin-right: auto; ">
                  Redefinir a senha
                </button>
              </a>
            </div>
            <div style="font-size: 2.5rem; font-style: normal; line-height: 42px; color: #000; font-weight: 400; margin-left: auto; margin-right: auto; display: block; width: 80%;">
              <p>Não está conseguindo acessar a página?</p>
              <a style="color: #80b9fc; margin-bottom: 50px; font-size: 1.5rem;" href="${redirectUrl}" target="_blank">
                Clique aqui para continuar.
              </a>
            </div>
          </div>
        </main>
        <footer style="background-color: #7dbfeb; height: 5vh; display: block; bottom: 0; width: 1440px; text-align: center;margin: 0;">
          <p style="font-size: 1.5rem;color: #000; margin:0;">
            Desenvolvido por Cápri Corp.
          </p>
        </footer>
      </body>
    </html>`;
  }
}
