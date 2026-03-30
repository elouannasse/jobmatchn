import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { JobModule } from './job/job.module';
import { CompanyModule } from './company/company.module';
import { ApplicationModule } from './application/application.module';
import { MatchingModule } from './matching/matching.module';
import { NotificationModule } from './notification/notification.module';
import { StatsModule } from './stats/stats.module';
import { CandidatesModule } from './candidates/candidates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: config.get('GMAIL_USER'),
            pass: config.get('GMAIL_APP_PASSWORD'),
          },
        },
        defaults: {
          from: `"JobMatchn Support" <${config.get('GMAIL_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    JobModule,
    CompanyModule,
    ApplicationModule,
    MatchingModule,
    NotificationModule,
    StatsModule,
    CandidatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
