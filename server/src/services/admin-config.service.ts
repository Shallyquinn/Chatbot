import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminConfigService {
  private messageCache: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {
    void this.initializeCache();
  }

  // Default messages that admins can modify
  private defaultMessages = {
    greeting: {
      en: "Hello! Welcome to Honey Chatbot. I'm here to help you with family planning questions.",
      yo: 'Bawo! Kaabo si Honey Chatbot. Mo wa nibi lati ran e lowo pelu awon ibeere nipa eto idile.',
      ha: 'Sannu! Barka da zuwa Honey Chatbot. Ina nan don taimaka muku da tambayoyin tsarin iyali.',
    },
    agent_escalation: {
      en: "I'm connecting you with a human agent. Please wait a moment while I transfer your chat.",
      yo: 'Mo n so e si eniyan ti o ni imoran. E duro diie ti mo ba fi chat yin gbe.',
      ha: 'Ina hadar da ku da wani wakili na mutum. Don Allah ku jira dan lokaci yayin da nake canja hirar ku.',
    },
    agent_assigned: {
      en: "Great! I've connected you with a human agent. They'll be with you shortly.",
      yo: 'O dara! Mo ti so yin si eniyan ti o ni imoran. Won yoo wa pelu yin laipe.',
      ha: 'Da kyau! Na hadar da ku da wani wakili. Za su zo muku nan ba da dadewa ba.',
    },
    agent_queued: {
      en: "I'm adding you to the queue for a human agent. Please wait while we connect you.",
      yo: 'Mo fi yin si laini fun eniyan ti o ni imoran. E duro ti a ba so yin.',
      ha: 'Ina saka ku a layi don wakili na mutum. Don Allah ku jira yayin da muke hadar da ku.',
    },
    fpm_start: {
      en: "Let's help you find the right family planning method. What's your main goal?",
      yo: 'Je ka ran e lowo lati wa ọna eto idile ti o tọ. Kini ibi-afẹde akọkọ yin?',
      ha: 'Mu taimaka muku samun hanyar tsarin iyali da ta dace. Menene babban manufar ku?',
    },
    language_selection: {
      en: 'Please choose the language you want to chat with',
      yo: 'Jowo yan ede ti e fe ba wa soro',
      ha: 'Don Allah zaɓi harshen da kuke son yin hira da shi',
    },
    ai_agent_selected: {
      en: "Perfect! I'm here to help. Please ask your question and I'll do my best to provide accurate information.",
      yo: 'O pe! Mo wa nibi lati ran yin lowo. E beere ibeere yin, emi yoo se apapọ lati fun yin ni alaye ti o tọ.',
      ha: 'Da kyau! Ina nan don taimaka muku. Don Allah ku yi tambayar ku zan yi iya na don samar muku da sahihiyar bayani.',
    },
    error_general: {
      en: "I'm sorry, something went wrong. Let me try to help you in a different way.",
      yo: 'Ma binu, nkan kan ti bajẹ. Je ki n gbiyanju lati ran yin lowo ni ọna miiran.',
      ha: 'Yi hakuri, wani abu ya faru. Bari in gwada taimaka muku ta wata hanya.',
    },
  };

  private async initializeCache() {
    const configs = await this.prisma.chatbotConfig.findMany();
    configs.forEach((config) => {
      this.messageCache.set(config.key, config.value);
    });
  }

  async initializeDefaultMessages() {
    for (const [key, translations] of Object.entries(this.defaultMessages)) {
      for (const [lang, message] of Object.entries(translations)) {
        const fullKey = `${key}_${lang}`;
        const exists = await this.prisma.chatbotConfig.findUnique({
          where: { key: fullKey },
        });

        if (!exists) {
          await this.prisma.chatbotConfig.create({
            data: {
              key: fullKey,
              value: message,
              category: 'MESSAGES',
              updatedBy: 'SYSTEM',
            },
          });

          this.messageCache.set(fullKey, message);
        }
      }
    }
  }

  async updateMessage(
    key: string,
    value: string,
    adminId: string,
    language = 'en',
  ) {
    const fullKey = `${key}_${language}`;

    const updated = await this.prisma.chatbotConfig.upsert({
      where: { key: fullKey },
      update: {
        value: value,
        updatedBy: adminId,
      },
      create: {
        key: fullKey,
        value: value,
        category: 'MESSAGES',
        updatedBy: adminId,
      },
    });

    this.messageCache.set(fullKey, value);
    return updated;
  }

  async getMessage(key: string, language = 'en'): Promise<string> {
    const fullKey = `${key}_${language}`;

    let message = this.messageCache.get(fullKey);

    if (!message) {
      const config = await this.prisma.chatbotConfig.findUnique({
        where: { key: fullKey },
      });

      if (config) {
        message = config.value;
        this.messageCache.set(fullKey, message);
      }
    }

    if (!message && language !== 'en') {
      return this.getMessage(key, 'en');
    }

    return (
      message ||
      this.defaultMessages[key]?.[language] ||
      `Message not found: ${key}`
    );
  }

  async getAllMessages(language = 'en') {
    const configs = await this.prisma.chatbotConfig.findMany({
      where: {
        category: 'MESSAGES',
        key: {
          endsWith: `_${language}`,
        },
      },
    });

    const messages = {};
    configs.forEach((config) => {
      const baseKey = config.key.replace(`_${language}`, '');
      messages[baseKey] = config.value;
    });

    return messages;
  }

  async updateChatbotOptions(key: string, options: string[], adminId: string) {
    const optionsKey = `${key}_options`;

    await this.prisma.chatbotConfig.upsert({
      where: { key: optionsKey },
      update: {
        value: JSON.stringify(options),
        updatedBy: adminId,
      },
      create: {
        key: optionsKey,
        value: JSON.stringify(options),
        category: 'OPTIONS',
        updatedBy: adminId,
      },
    });

    this.messageCache.set(optionsKey, JSON.stringify(options));
  }

  async getChatbotOptions(key: string): Promise<string[]> {
    const optionsKey = `${key}_options`;

    let optionsStr = this.messageCache.get(optionsKey);

    if (!optionsStr) {
      const config = await this.prisma.chatbotConfig.findUnique({
        where: { key: optionsKey },
      });

      if (config) {
        optionsStr = config.value;
        this.messageCache.set(optionsKey, optionsStr);
      }
    }

    try {
      return optionsStr ? JSON.parse(optionsStr) : [];
    } catch {
      return [];
    }
  }

  async getSystemSettings() {
    return await this.prisma.chatbotConfig.findMany({
      where: {
        category: 'SYSTEM',
      },
      orderBy: { key: 'asc' },
    });
  }

  async updateSystemSetting(key: string, value: string, adminId: string) {
    const updated = await this.prisma.chatbotConfig.upsert({
      where: { key: key },
      update: {
        value: value,
        updatedBy: adminId,
      },
      create: {
        key: key,
        value: value,
        category: 'SYSTEM',
        updatedBy: adminId,
      },
    });

    this.messageCache.set(key, value);
    return updated;
  }

  private broadcastConfigUpdate(key: string, value: string, language: string) {
    console.log(`Broadcasting config update: ${key}_${language} = ${value}`);
  }

  async getConfigurationHistory(key?: string) {
    const where = key
      ? {
          key: {
            contains: key,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return await this.prisma.chatbotConfig.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async exportConfiguration() {
    const config = await this.prisma.chatbotConfig.findMany({
      orderBy: { category: 'asc' },
    });

    return {
      exportedAt: new Date(),
      version: '1.0',
      configuration: config,
    };
  }

  async importConfiguration(configData: Record<string, any>, adminId: string) {
    const results: Array<{ key: string; status: string; error?: string }> = [];

    for (const item of configData.configuration) {
      try {
        await this.prisma.chatbotConfig.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            category: item.category,
            updatedBy: adminId,
          },
          create: {
            key: item.key,
            value: item.value,
            category: item.category,
            updatedBy: adminId,
          },
        });

        this.messageCache.set(item.key, item.value);
        results.push({ key: item.key, status: 'SUCCESS' });
      } catch (error) {
        results.push({ key: item.key, status: 'ERROR', error: error.message });
      }
    }

    return results;
  }

  async refreshCache() {
    this.messageCache.clear();
    await this.initializeCache();
  }

  getCacheStats() {
    return {
      totalCached: this.messageCache.size,
      keys: Array.from(this.messageCache.keys()),
    };
  }
}
