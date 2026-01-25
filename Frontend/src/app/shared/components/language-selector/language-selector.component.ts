import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { LanguageService, SupportedLanguage } from '@app/core/services/language.service';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  icon: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage: string = 'en';
  
  languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', icon: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', icon: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', icon: '🇮🇳' }
  ];

  constructor(
    private languageService: LanguageService,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  async openLanguageSelector() {
    const buttons = this.languages.map(lang => ({
      text: `${lang.icon} ${lang.nativeName}`,
      role: this.currentLanguage === lang.code ? 'selected' : undefined,
      cssClass: this.currentLanguage === lang.code ? 'action-sheet-selected' : '',
      handler: () => {
        this.changeLanguage(lang.code);
      }
    }));

    buttons.push({
      text: this.languageService.instant('common.cancel'),
      role: 'cancel',
      cssClass: 'action-sheet-cancel',
      handler: () => {}
    });

    const actionSheet = await this.actionSheetController.create({
      header: this.languageService.instant('auth.preferred_language'),
      buttons: buttons
    });

    await actionSheet.present();
  }

  changeLanguage(lang: SupportedLanguage) {
    this.languageService.setLanguage(lang);
  }

  getCurrentLanguageName(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage);
    return lang ? `${lang.icon} ${lang.nativeName}` : 'English';
  }
}
