import { useEffect, useRef, useState } from 'react';

const TranslateWidget = () => {
    const containerRef = useRef(null);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // 1. WYKRYWANIE JĘZYKA SYSTEMU / PRZEGLĄDARKI
        const userLang = (navigator.language || navigator.userLanguage).split('-')[0];
        const supportedLanguages = ['en', 'uk', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ar'];

        // Jeśli wykryjemy wspierany język obcy
        if (userLang !== 'pl' && supportedLanguages.includes(userLang)) {
            if (!document.cookie.includes('googtrans')) {
                document.cookie = `googtrans=/pl/${userLang}; path=/;`;
                window.location.reload();
            }
            // Ukrywamy wyłącznie czarny boks wizualny, ale pozwalamy skryptowi poniżej się załadować!
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldRender(false);
        }

        // 2. ŁADOWANIE SILNIKA GOOGLE TRANSLATE (musi się wykonać zawsze)
        if (window.googleTranslateAlreadyLoaded) return;
        window.googleTranslateAlreadyLoaded = true;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.onerror = () => {
            console.error('Failed to load Google Translate script');
        };
        document.body.appendChild(script);

        window.googleTranslateElementInit = function() {
            // Inicjalizujemy element tylko wtedy, gdy kontener jest na ekranie (dla języka PL)
            // Jeśli targetujemy język obcy, Google i tak odczyta ciasteczko i przetłumaczy stronę, nawet bez fizycznego kontenera widgetu
            new window.google.translate.TranslateElement({
                pageLanguage: 'pl',
                includedLanguages: 'en,uk,de,fr,es,it,pt,ru,zh-CN,zh-TW,ar',
                layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL
            }, shouldRender ? containerRef.current : null);
        };
    }, [shouldRender]);

    // Jeśli język został automatycznie dopasowany, nie pokazujemy czarnego paska,
    // ale skrypt w tle i tak działa i tłumaczy stronę!
    if (!shouldRender) return null;

    return (
        <div
            id="google-translate-widget"
            ref={containerRef}
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 9999,
                padding: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
      <span style={{ color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: 500 }}>
        Translate:
      </span>
        </div>
    );
};

export default TranslateWidget;