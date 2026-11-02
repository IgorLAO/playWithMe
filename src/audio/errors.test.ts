import {describe,it,expect} from 'vitest';
import {microphoneErrorMessage} from './errors';
describe('microphone diagnostics',()=>{it('explains HTTP network origins',()=>{expect(microphoneErrorMessage(new Error('getUserMedia indisponível'),false,'192.168.1.20')).toContain('HTTPS');expect(microphoneErrorMessage(new Error('getUserMedia indisponível'),false,'192.168.1.20')).toContain('localhost');});});
