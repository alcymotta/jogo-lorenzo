# Arquitetura 10x - Ilha de Capibara

## Visao geral

A arquitetura foi evoluida mantendo compatibilidade com o projeto original.

Camadas principais:

1. `GameEngine` (`js/game.js`): orquestracao do loop e sistemas.
2. `WorldSystem` (`js/world.js`): atmosfera, qualidade e atualizacao do ambiente.
3. `MapGenerator` (`js/map.js`): biomas, estruturas, agua com shader, fauna ambiente.
4. `Player` + `ControlSystem` + `ThirdPersonCamera`: gameplay base.
5. `SkinSystem` (`js/skins.js`): aplicacao de skins por configuracao.
6. `UISystem` (`js/ui.js`): minimapa, status online/rede, menu de skins, barra de emotes.
7. `NetworkSystem` (`js/network.js`): multiplayer opcional via WebSocket.
8. `ChatSystem` (`js/chat.js`): mensagens, codigos especiais e comandos.

## Fluxo de inicializacao

1. `main.js` instancia `GameEngine`.
2. `GameEngine` cria renderer, camera, luzes e fisica.
3. `WorldSystem` constroi o mundo (`MapGenerator`).
4. `Player` e controles sao criados.
5. `SkinSystem` aplica skin inicial.
6. `UISystem` inicializa HUD expandida.
7. `NetworkSystem` fica pronto para conectar quando jogador entra com nome.
8. Loop principal atualiza: controles -> fisica -> player -> mundo -> NPC -> rede -> UI -> render.

## Multiplayer

- Cliente: `js/network.js`
- Servidor: `server/multiplayer-server.js`
- Sala padrao: `ilha-main`
- Limite: 20 jogadores

Sincronizacoes:
- spawn/despawn
- nome acima da cabeca
- posicao/rotacao
- transformacao/skin
- chat global

## Performance

- `InstancedMesh` para vegetacao (arvores, arbustos, flores, grama)
- perfil mobile/desktop com qualidade adaptativa
- limite de pixel ratio
- sombras ajustadas por perfil
- LOD simples de particulas em mobile

## Compatibilidade preservada

Itens mantidos:
- chat
- codigos especiais
- transformacoes
- voo
- martelo do banimento
- suporte mobile com joystick e pulo
- fullscreen
