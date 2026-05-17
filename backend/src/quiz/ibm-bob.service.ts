import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class IBMBoBService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async generateQuizQuestions(params: {
        topic: string;
        difficulty: string;
        questionCount: number;
        questionType: string;
    }) {
        const apiKey =
            this.configService.get<string>(
                'IBM_BOB_API_KEY',
            );

        if (!apiKey) {
            throw new BadRequestException(
                'IBM BoB API key missing',
            );
        }

        // TEMP MOCK RESPONSE
        // Replace later with real API

        return [
            {
                question_text:
                    'What is a database?',
                question_type: 'mcq',
                difficulty: 1,

                options: [
                    {
                        option_text:
                            'A collection of organized data',
                        is_correct: true,
                    },
                    {
                        option_text:
                            'A programming language',
                        is_correct: false,
                    },
                    {
                        option_text:
                            'A CPU component',
                        is_correct: false,
                    },
                    {
                        option_text:
                            'A browser',
                        is_correct: false,
                    },
                ],

                explanation:
                    'Databases store organized information.',
            },
        ];
    }
}