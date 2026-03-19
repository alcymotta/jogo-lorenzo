/**
 * skins.js - Sistema de skins do jogador
 * Mantem compatibilidade com o sistema de transformacoes via chat.
 */

class SkinSystem {
    constructor(engine) {
        this.engine = engine;
        this.skins = {
            normal: {
                id: 'normal',
                name: 'Normal',
                scale: { x: 1, y: 1, z: 1 },
                colors: {
                    skin: 0xFFB347,
                    shirt: 0xF4A460,
                    pants: 0x3A5F8A,
                    hair: 0x3B2A1E,
                    accessory: 0x5A3A2A
                }
            },
            capybara: {
                id: 'capybara',
                name: 'Capivara',
                scale: { x: 1.15, y: 0.95, z: 1.15 },
                colors: {
                    skin: 0x8B5E34,
                    shirt: 0x8B4513,
                    pants: 0x6F4E37,
                    hair: 0x5B3A29,
                    accessory: 0x5C402D
                }
            },
            nube: {
                id: 'nube',
                name: 'Nube',
                scale: { x: 1.2, y: 1.2, z: 1.2 },
                colors: {
                    skin: 0xF6FCFF,
                    shirt: 0xFFFFFF,
                    pants: 0xD9EEFF,
                    hair: 0xEAF7FF,
                    accessory: 0xCBE6FF
                }
            },
            guarda: {
                id: 'guarda',
                name: 'Guarda',
                scale: { x: 1.08, y: 1.2, z: 1.08 },
                colors: {
                    skin: 0xF6C28B,
                    shirt: 0x1E3D8F,
                    pants: 0x102A60,
                    hair: 0x1A1A1A,
                    accessory: 0x2E4FB0
                }
            },
            c00lkidd: {
                id: 'c00lkidd',
                name: 'c00lkidd',
                scale: { x: 0.95, y: 1.08, z: 0.95 },
                colors: {
                    skin: 0xFFD2B1,
                    shirt: 0xFF1493,
                    pants: 0x7C2D8D,
                    hair: 0x281632,
                    accessory: 0xB21D85
                }
            }
        };
    }

    getSkin(skinId) {
        return this.skins[skinId] || this.skins.normal;
    }

    getAllSkins() {
        return Object.values(this.skins);
    }

    applySkinToPlayer(player, skinId) {
        if (!player) return;
        const skin = this.getSkin(skinId);
        player.applySkinConfig(skin);

        if (this.engine && this.engine.uiSystem) {
            this.engine.uiSystem.setSelectedSkin(skin.id);
        }
    }
}
