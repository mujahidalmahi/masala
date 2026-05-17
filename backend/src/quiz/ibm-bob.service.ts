import {
    Injectable,
    BadRequestException,
    Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class IBMBoBService {
    private readonly logger = new Logger(IBMBoBService.name);

    constructor(
        private readonly configService: ConfigService,
    ) { }

    async generateQuizQuestions(params: {
        topic: string;
        difficulty: string;
        questionCount: number;
        questionType: string;
    }) {
        const apiKey = this.configService.get<string>('IBM_BOB_API_KEY');
        const apiUrl = this.configService.get<string>('IBM_BOB_API_URL') || 'https://bob.ibm.com/api/v1';

        if (!apiKey) {
            throw new BadRequestException('IBM BoB API key missing');
        }

        try {
            const response = await fetch(`${apiUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    topic: params.topic,
                    difficulty: params.difficulty,
                    question_count: params.questionCount,
                    question_type: params.questionType,
                    num_questions: params.questionCount,
                    type: params.questionType,
                }),
            });

            if (!response.ok) {
                throw new Error(`IBM BoB API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Normalise response — handle both array and { questions: [...] }
            const raw: any[] = Array.isArray(data) ? data : (data.questions || data.data || []);

            if (!raw.length) {
                throw new Error('IBM BoB API returned no questions');
            }

            return raw.map((q: any) => ({
                question_text: q.question_text || q.question || q.text,
                question_type: q.question_type || q.type || 'mcq',
                difficulty: typeof q.difficulty === 'number' ? q.difficulty : 3,
                explanation: q.explanation || q.rationale || null,
                options: (q.options || q.choices || []).map((o: any) => ({
                    option_text: o.option_text || o.text || o.choice || o,
                    is_correct: o.is_correct ?? o.correct ?? false,
                })),
            }));
        } catch (err: any) {
            this.logger.error(`IBM BoB API call failed: ${err.message}`);
            throw new BadRequestException(`Quiz generation failed: ${err.message}`);
        }
    }
}