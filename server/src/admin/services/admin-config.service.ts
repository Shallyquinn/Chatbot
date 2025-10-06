// src/services/admin-config.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigCategory } from '@prisma/client';

@Injectable()
export class AdminConfigService implements OnModuleInit {
  private configCache = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.initializeDefaultMessages();
    await this.loadConfigToCache();
  }

  // Default messages that match your existing chatbot flow
  private defaultMessages = {
    greeting: {
      en: "Hello! Welcome to Honey Chatbot. I'm here to help you with family planning questions.",
      yo: 'Bawo! Kaabo si Honey Chatbot. Mo wa nibi lati ran e lowo pelu awon ibeere nipa eto idile.',
      ha: 'Sannu! Barka da zuwa Honey Chatbot. Ina nan don taimaka muku da tambayoyin tsarin iyali.',
    },
    language_selection: {
      en: 'Please choose the language you want to chat with',
      yo: 'Je ka yan ede ti o fe ba soro pelu',
      ha: 'Don Allah zaɓi harshen da kuke so ku yi hira da shi',
    },
    agent_escalation: {
      en: "I'm connecting you with a human agent. Please wait a moment while I transfer your chat.",
      yo: 'Mo n so e si eniyan ti o ni imoran. E duro diie ti mo ba fi chat yin gbe.',
      ha: 'Ina hadar da ku da wani wakili na mutum. Don Allah ku jira dan lokaci yayin da nake canja hirar ku.',
    },
    agent_assigned: {
      en: "Great! I've connected you with {agentName}. They'll be with you shortly.",
      yo: 'O dara! Mo ti so e si {agentName}. Won yoo wa pelu e laipẹ.',
      ha: 'Mai kyau! Na hadar da ku da {agentName}. Za su kasance tare da ku nan da nan.',
    },
    agent_queued: {
      en: "I'm adding you to the queue for a human agent. You're position {position} with an estimated wait time of {waitTime}.",
      yo: 'Mo n fi e si laini fun eniyan ti o ni imoran. Ipo re ni {position} pelu akoko duro ti a ro pe {waitTime}.',
      ha: 'Ina ƙara ku a cikin jerin gwano don wakili na mutum. Matsayin ku {position} tare da ƙididdige lokacin jira na {waitTime}.',
    },
    fpm_start: {
      en: "Let's help you find the right family planning method. What's your main goal?",
      yo: 'Je ka ran e lowo lati wa ọna eto idile ti o tọ. Kini ibi-afẹde akọkọ yin?',
      ha: 'Mu taimaka muku samun hanyar tsarin iyali da ta dace. Menene babban manufar ku?',
    },
    ai_agent_selected: {
      en: "Perfect! I'm here to help. Please ask your question and I'll do my best to provide accurate information.",
      yo: 'Pe! Mo wa nibi lati ran e lowo. Je ka beere ibeere yin ati pe mo yoo ṣe adayeba mi lati fi alaye ti o pe.',
      ha: 'Kyau! Ina nan don taimakawa. Don Allah ku yi tambayar ku kuma zan yi iya ƙokarina don ba da cikakken bayani.',
    },
  };

  private defaultOptions = {
    fmp_goals: [
      'Start using family planning',
      'Change my current method',
      'Stop using family planning',
      'Emergency contraception',
      'General questions',
    ],
    languages: ['English', 'Hausa', 'Yoruba'],
    age_groups: ['< 25', '26-35', '36-45', '46-55', '55 and older'],
    marital_status: [
      'Single',
      'In a relationship',
      'Married',
      'Prefer not to say',
    ],
  };

  async initializeDefaultMessages() {
    console.log('Initializing default messages...');

    // Initialize messages
    for (const [key, translations] of Object.entries(this.defaultMessages)) {
      for (const [lang, message] of Object.entries(translations)) {
        const configKey = `${key}_${lang}`;

        const exists = await this.prisma.chatbotConfig.findUnique({
          where: { key: configKey },
        });

        if (!exists) {
          await this.prisma.chatbotConfig.create({
            data: {
              key: configKey,
              value: message,
              category: 'MESSAGES' as ConfigCategory,
              language: lang,
            },
          });
        }
      }
    }

    // Initialize options
    for (const [key, options] of Object.entries(this.defaultOptions)) {
      const configKey = `${key}_options`;

      const exists = await this.prisma.chatbotConfig.findUnique({
        where: { key: configKey },
      });

      if (!exists) {
        await this.prisma.chatbotConfig.create({
          data: {
            key: configKey,
            value: JSON.stringify(options),
            category: 'OPTIONS' as ConfigCategory,
            language: 'en',
          },
        });
      }
    }

    console.log('Default messages initialized successfully');
  }

  private async loadConfigToCache() {
    const configs = await this.prisma.chatbotConfig.findMany();
    this.configCache.clear();

    configs.forEach((config) => {
      this.configCache.set(config.key, config.value);
    });

    console.log(`Loaded ${configs.length} configurations to cache`);
  }

  async getMessage(key: string, language = 'en'): Promise<string> {
    const fullKey = `${key}_${language}`;

    // Try cache first
    let message = this.configCache.get(fullKey);

    if (!message && language !== 'en') {
      // Fallback to English
      message = this.configCache.get(`${key}_en`);
    }

    if (!message) {
      // Fallback to database
      const config = await this.prisma.chatbotConfig.findUnique({
        where: { key: fullKey },
      });
      message = config?.value;
    }

    return message || `Message not found: ${key}`;
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
        value,
        updatedBy: adminId,
        updatedAt: new Date(),
      },
      create: {
        key: fullKey,
        value,
        category: 'MESSAGES' as ConfigCategory,
        language,
        updatedBy: adminId,
      },
    });

    // Update cache
    this.configCache.set(fullKey, value);

    return updated;
  }

  async getChatbotOptions(key: string): Promise<string[]> {
    const optionsKey = `${key}_options`;
    let optionsStr = this.configCache.get(optionsKey);

    if (!optionsStr) {
      const config = await this.prisma.chatbotConfig.findUnique({
        where: { key: optionsKey },
      });
      optionsStr = config?.value;
    }

    try {
      return optionsStr ? JSON.parse(optionsStr) : [];
    } catch {
      return [];
    }
  }

  async updateChatbotOptions(key: string, options: string[], adminId: string) {
    const optionsKey = `${key}_options`;
    const value = JSON.stringify(options);

    const updated = await this.prisma.chatbotConfig.upsert({
      where: { key: optionsKey },
      update: {
        value,
        updatedBy: adminId,
        updatedAt: new Date(),
      },
      create: {
        key: optionsKey,
        value,
        category: 'OPTIONS' as ConfigCategory,
        language: 'en',
        updatedBy: adminId,
      },
    });

    // Update cache
    this.configCache.set(optionsKey, value);

    return updated;
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

  async refreshCache() {
    await this.loadConfigToCache();
  }
}
