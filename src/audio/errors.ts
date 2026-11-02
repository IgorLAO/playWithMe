export function microphoneErrorMessage(error:unknown, secureContext:boolean, hostname:string):string {
 if(!secureContext) return `O navegador bloqueou o microfone porque esta página usa HTTP em ${hostname}. Abra em https://localhost:5173 no mesmo computador ou use https://<IP>:5173 na rede. O servidor usa HTTPS por padrão (bun run dev); aceite o certificado local no navegador.`;
 if(!navigator.mediaDevices?.getUserMedia) return 'Este navegador não disponibiliza acesso ao microfone. Atualize o navegador e verifique as permissões do site.';
 const name=error instanceof DOMException?error.name:error instanceof Error?error.name:'';
 switch(name){
  case 'NotAllowedError':case 'PermissionDeniedError':return 'Permissão do microfone negada. Libere o microfone nas permissões deste site e tente novamente.';
  case 'NotFoundError':return 'Nenhuma entrada de áudio foi encontrada. Conecte a interface USB e atualize a lista de dispositivos.';
  case 'OverconstrainedError':return 'A entrada USB selecionada não está mais disponível. Escolha outra entrada e tente novamente.';
  case 'NotReadableError':return 'A entrada de áudio está ocupada ou indisponível. Feche outros aplicativos que usam a interface USB e tente novamente.';
  case 'SecurityError':return 'O navegador bloqueou a captura por segurança. Use localhost ou HTTPS e verifique as permissões do site.';
  default:return `Não foi possível iniciar o microfone: ${error instanceof Error?error.message:String(error)}`;
 }
}
