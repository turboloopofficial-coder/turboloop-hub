// Seed the German backfill translations for the 10 foundational EN
// posts identified in the Phase A/B/C audit.
//
// Idempotent — uses INSERT ... ON CONFLICT (slug) DO NOTHING. Safe to
// re-run; existing rows are preserved untouched (the admin may have
// edited them; we never overwrite).
//
// Each translation:
//   - slug = "<parent-slug>-de"
//   - language = "de"
//   - published = true       (the EN parent is already live)
//   - translation_of = <parent.id>
//   - scheduled_publish_at = NULL  (no future publish; the post lands
//                                    immediately on insert)
//   - reading_time_min = computed inline from the German content
//
// Why backfill rather than future-schedule: these are translations of
// posts that are already live in English. The Telegram cron won't
// re-announce them (it only fires on the daily publishOverdueBlogs
// window for posts whose scheduled_publish_at just crossed now()).
// That's the desired behaviour — we don't want to spam the EN/DE
// channels with 10 "today's read" messages all at once.

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const TRANSLATIONS = [
  {
    parentId: 1,
    parentSlug: "what-is-turbo-loop-complete-defi-ecosystem",
    title: "Was ist Turbo Loop? Das vollständige DeFi-Ökosystem erklärt",
    excerpt:
      "Sechs Säulen, ein selbsttragender Motor. Was Turbo Loop von jedem anderen Yield-Protokoll auf BSC unterscheidet.",
    content: `Die meisten DeFi-Projekte machen eine Sache — einen Swap, eine Farm, einen Lending-Markt. Turbo Loop macht sechs. Und sie stehen nicht einfach nebeneinander. Sie nähren sich gegenseitig.

Das ist die ganze Idee: ein Ökosystem, in dem jeder Teil jeden anderen Teil stärker macht.

## Die sechs Säulen

Turbo Loop vereint sechs eigenständige DeFi-Primitive zu einem einzigen, sich selbst verstärkenden System:

1. **Turbo Buy** — Fiat-zu-Krypto-On-Ramp. Nutzer kaufen USDT direkt mit ihrer Landeswährung, ohne zentrale Börse dazwischen.
2. **Turbo Swap** — Eine integrierte DEX für sofortige Token-Tauschvorgänge mit niedrigen Gebühren.
3. **Yield Farming** — Der Kern. USDT einzahlen, an echten Protokollumsätzen verdienen.
4. **Referral-Netzwerk** — 20 Ebenen tief. 51 % der Belohnungen fließen zurück an die Community-Aufbauer.
5. **Leadership-Programm** — Sieben Ränge, vom Builder bis zum Legend. Monatliche Auszahlungen an die besten Community-Organisatoren.
6. **Smart-Contract-Sicherheit** — Auditiert. Ownership renunciert. LP gelockt. Auf BscScan überprüfbar.

> [!KEY]
> Die meisten Yield-Protokolle bezahlen Nutzer aus Token-Emissionen — das heißt, neue Einzahlungen bezahlen alte. Turbo Loops Yield kommt aus echter Protokollaktivität: Swap-Gebühren, On-Ramp-Gebühren und LP-Belohnungen. Deshalb bricht es nicht zusammen.

## Wie die Teile zusammenhängen

Schauen Sie sich an, was passiert, wenn ein einziger neuer Nutzer USDT einzahlt:

- Die Einzahlung landet im LP-Pool und erzeugt Swap-Gebühren
- Ihr Werber verdient einen Prozentsatz (und *dessen* Werber bis zur 20. Ebene)
- Die Swap-Gebühren speisen den Yield-Pool, aus dem alle verdienen
- Der On-Ramp hat es erst möglich gemacht, überhaupt in DeFi anzukommen
- Das Audit + die renuncierte Ownership haben dafür gesorgt, dass sie dem Contract genug vertrauen, um einzuzahlen

Jede Aktion löst Kaskaden aus. Das ist der **Revenue Flywheel**.

## Was es nicht ist

Turbo Loop ist nicht:

- Ein Token-Launch (kein nativer Token — bewusst so gewählt)
- Eine Meme-Play
- Ein Protokoll, dem man jemandem vertrauen muss, der es betreibt (Ownership ist renunciert)
- Eine kurzfristige Promotion (der Contract ist permanent und immutable)

> [!TIP]
> Glauben Sie uns nichts davon einfach — überprüfen Sie den Contract auf BscScan, lesen Sie das Audit, schauen Sie sich den LP-Lock selbst an. Genau das ist der Sinn.

## Warum das wichtig ist

DeFi hat ein Glaubwürdigkeitsproblem. Die meisten Projekte launchen einen Token, hypen ihn und kollabieren. Die, die überleben, sind die, die um echte ökonomische Aktivität herum gebaut sind.

Turbo Loop ist um drei echte Einnahmequellen gebaut, die unabhängig von Token-Spekulation existieren: Leute swappen, Leute on-ramen, Leute stellen Liquidität bereit. Der Yield kommt daraus — nicht aus Token-Drucken.

## Kernpunkte

- Turbo Loop = sechs DeFi-Primitive in einem selbsttragenden Ökosystem
- Yield kommt aus echter Aktivität (Swap-Gebühren + On-Ramp-Gebühren + LP-Belohnungen), nicht aus Token-Emissionen
- 20-Ebenen-Referral bedeutet, dass Community-Wachstum direkt den Yield verstärkt
- Smart Contract ist auditiert, renunciert und LP-gelockt — on-chain für jeden überprüfbar

Willkommen beim transparentesten Yield-Protokoll auf BSC.`,
  },
  {
    parentId: 3,
    parentSlug: "turbo-loop-security-deep-dive",
    title: "Warum Turbo Loop eines der sichersten DeFi-Protokolle auf BSC ist",
    excerpt:
      "Fünf Sicherheitssäulen, die Turbo Loop trustless by design machen — nicht durch Versprechen.",
    content: `Sicherheit in DeFi ist kein Feature — sie ist das Fundament. Wenn der Contract nicht sicher ist, spielt nichts anderes eine Rolle.

Turbo Loops Sicherheitsmodell baut auf fünf Säulen. Jede einzelne ist von Ihnen überprüfbar, sofort, ohne spezielle Tools.

## Säule 1: Unabhängiges Audit

Der Smart Contract wurde vor dem Launch von einer externen Sicherheitsfirma auditiert. Kein Self-Audit. Kein Freundschafts-Review aus dem Team. Ein unabhängiges Audit mit einem öffentlichen Report.

> [!INFO]
> Ein Audit bedeutet nicht, dass der Contract für immer bugfrei ist. Es bedeutet, dass zum Zeitpunkt des Audits keine kritischen Probleme von Profis gefunden wurden, deren Job es ist, sie zu finden. Das ist die höchste Hürde, die ein Smart Contract vor dem Launch nehmen kann.

## Säule 2: Renuncierte Ownership

Das ist die große Sache. Nach der Bereitstellung hat das Team \`renounceOwnership()\` auf dem Contract aufgerufen. Diese Funktion überträgt das Eigentum an die Null-Adresse — \`0x0000...0000\`.

Was das praktisch bedeutet:

- Niemand kann Gebühren ändern
- Niemand kann den Contract pausieren
- Niemand kann Token minten
- Niemand kann Gelder abziehen
- Niemand kann die Logik upgraden

Das Team hat denselben Zugriff auf den Contract wie ein zufälliger Nutzer auf der Straße. Null. Keinen.

> Renuncierte Ownership ist der Unterschied zwischen "Sie müssen dem Team vertrauen" und "Sie müssen niemandem vertrauen."

## Säule 3: 100 % LP gelockt

Die LP-Tokens des Liquidity Pools werden an einen Time-Lock-Contract gesendet. Sie können nicht abgehoben werden. Niemals.

Damit fällt der häufigste DeFi-Exit-Scam weg: das Team zieht Liquidität ab und verschwindet mit den Einzahlungen aller. Mit gelocktem LP ist **die Liquidität strukturell permanent**.

## Säule 4: Auf BscScan verifiziert

Der Quellcode des Contracts ist auf BscScan veröffentlicht und verifiziert. Jeder kann:

- Jede Zeile lesen
- Jede Funktion sehen
- Jede State-Variable prüfen
- Jede Transaktion verfolgen

> [!TIP]
> Wenn Sie irgendetwas davon selbst überprüfen wollen, suchen Sie die Turbo-Loop-Contract-Adresse auf bscscan.com, klicken Sie auf den "Contract"-Tab und dann auf "Read Contract", um den Live-State zu sehen, oder auf "Code" für den Quellcode.

## Säule 5: 100 % On-Chain-Operationen

Keine Off-Chain-Komponenten. Kein Backend, das über Ihren Stand lügen kann. Keine private Datenbank, die modifiziert werden kann. Alles ist auf der Blockchain — jede Einzahlung, jede Belohnung, jede Auszahlung.

Wenn das BSC-Netzwerk online ist, sind Ihre Gelder zugänglich. Es gibt keine Webseite, deren Ausfall Ihren Zugriff blockiert. Der Contract IST das Protokoll.

## Die 100K-Challenge

Das Team ist so überzeugt von diesem Modell, dass **100.000 USDT** für jeden auf dem Tisch liegen, der beweisen kann, dass der Contract irgendeinen Zentralisierungspunkt hat — irgendeinen Weg für das Team, ohne Renunciation an Nutzergelder zu kommen.

> [!KEY]
> Ein offenes Bug-Bounty für Zentralisierung ist kein Marketing. Es ist eine permanente Herausforderung. Solange das Bounty existiert und unbeansprucht bleibt, ist das Beweis dafür, dass das Sicherheitsmodell funktioniert.

## Wogegen das nicht schützt

Ehrlich: Sicherheit ist nicht unendlich. Die fünf Säulen schützen gegen:

- Team-Rugpulls (unmöglich)
- Gebührenänderungen (unmöglich)
- Contract-Upgrades (unmöglich)
- Liquiditätsabzug (unmöglich)

Sie schützen nicht gegen:

- BSC-Netzwerkausfall (extrem unwahrscheinlich, aber theoretisch)
- Wallet-Kompromiss auf IHRER Seite (nutzen Sie Hardware-Wallets)
- Phishing (URLs immer prüfen)
- Protokoll-Level-Exploits auf BNB Chain

> Sicherheit ist ein Stack. Wir haben den Protokoll-Layer gemacht. Sie machen den Wallet-Layer.

## Kernpunkte

- 5 Säulen: Auditiert · Renunciert · LP gelockt · Verifiziert · On-Chain
- Alle fünf sind in unter 10 Minuten von jedem überprüfbar
- 100K-Bounty ist ein permanenter, öffentlicher Test des Modells
- Kein Team-Key, kein Upgrade-Pfad, kein Off-Chain-Backdoor
- Sie vertrauen Turbo Loop nicht. Sie verifizieren Turbo Loop.

Trustless by design — nicht durch Versprechen.`,
  },
  {
    parentId: 5,
    parentSlug: "turbo-loop-beginner-guide-first-24-hours",
    title:
      "Ihre ersten 24 Stunden mit Turbo Loop: Der vollständige Anfänger-Guide",
    excerpt:
      "Ihr erster Tag auf Turbo Loop, Stunde für Stunde geplant. Verbinden, einzahlen, compounden, teilen — ohne die Fehler, die neue Nutzer machen.",
    content: `Ihre ersten 24 Stunden auf Turbo Loop legen das Muster für alles Weitere fest. Machen Sie sie richtig, und Sie sind für compoundenden Erfolg aufgestellt. Machen Sie sie falsch, und Sie verbringen Wochen damit, vermeidbare Fehler zu korrigieren.

Hier ist das Playbook.

## Stunde 1: Wallet einrichten

Falls Sie noch keine haben, installieren Sie **MetaMask** oder **Trust Wallet**. Beide sind kostenlos, beide funktionieren gut mit BSC.

### BSC-Netzwerk hinzufügen
Die meisten Wallets sind standardmäßig auf Ethereum. Sie brauchen BSC:

- Netzwerkname: \`BNB Smart Chain\`
- RPC-URL: \`https://bsc-dataseed.binance.org/\`
- Chain-ID: \`56\`
- Symbol: \`BNB\`
- Block-Explorer: \`https://bscscan.com\`

> [!TIP]
> MetaMask hat jetzt einen "Netzwerk hinzufügen"-Button, der diese Felder für populäre Chains automatisch ausfüllt. Nutzen Sie den, wenn er verfügbar ist — spart Tipparbeit.

## Stunde 2: Startguthaben holen

Sie brauchen zwei Dinge:

1. **Eine kleine Menge BNB** (~5 $) für Gas-Gebühren
2. **USDT auf BSC** für Ihre eigentliche Einzahlung

Einfachster Weg: Nutzen Sie **Turbo Buy** (den integrierten Fiat-On-Ramp), um USDT direkt mit Ihrer Landeswährung zu kaufen. Oder transferieren Sie von einer zentralen Börse, die BSC-Auszahlungen unterstützt.

> [!WARN]
> Beim Transfer von einer Börse **prüfen Sie das Netzwerk doppelt**. USDT auf Ethereum (ERC-20) an ein BSC-Wallet zu senden bedeutet, die Gelder zu verlieren. Wählen Sie immer "BEP-20" oder "BSC" als Auszahlungsnetzwerk.

## Stunde 3: Erste Einzahlung machen

Verbinden Sie Ihre Wallet im dApp auf turboloop.io. Geben Sie USDT für Spending frei. Zahlen Sie ein.

Das ist alles. Der Contract erledigt den Rest automatisch.

## Stunden 4-12: Lesen, lernen, fragen

Das ist der wichtigste Block Ihres ersten Tages. Nicht einfach einzahlen und warten. Nutzen Sie die Zeit für:

- Das Einführungsvideo in Ihrer Sprache anschauen
- Den Revenue-Flywheel-Explainer lesen
- Den Contract selbst auf BscScan verifizieren
- Der Telegram-Community beitreten
- An einer täglichen Zoom-Session teilnehmen

> Die besten DeFi-Nutzer sind nicht die klügsten — sie sind die geduldigsten. Sie lernen, bevor sie skalieren.

## Stunde 13: Ihren Referral-Link holen

Im dApp kopieren Sie Ihren Referral-Link. Das ist Ihre eindeutige URL — jede Person, die darüber beitritt, steckt 20 Ebenen tief in Ihrer Referral-Kette.

Fügen Sie ihn hinzu zu:

- Ihrer Telegram-Bio
- Ihrem X-/Twitter-Pinned-Tweet
- Jedem DeFi-Blogpost, den Sie schreiben
- Überall, wo Sie natürlich über Krypto sprechen

> [!KEY]
> Ihr Referral ist keine Spielerei — es ist die zweite Einkommensquelle des Protokolls. Viele Top-Community-Mitglieder verdienen mehr aus ihrem Referral-Netzwerk als aus ihren eigenen Einlagen. So funktioniert Compound Community.

## Stunde 14: Compounding-Frequenz festlegen

Entscheiden Sie, wie oft Sie Ihren Earn re-loopen (compounden) werden. Die Mathematik:

- **Tägliches Compounding** = maximale Renditen, aber mehr Gas
- **Wöchentliches Compounding** = guter Kompromiss für die meisten
- **Monatliches Compounding** = einfacher, aber etwas geringere Renditen

> [!TIP]
> Bei Einzahlungen unter ~500 $ optimiert wöchentliches Compounding normalerweise die Netto-Renditen nach Gas. Über diesem Niveau macht täglich mehr Sinn.

## Stunden 15-23: Nichts anfassen

Im Ernst. Widerstehen Sie dem Drang, stündlich "nachzuschauen". Der Contract macht genau das, wofür er gebaut ist. Treten Sie zurück. Holen Sie einen Kaffee. Lesen Sie ein Buch.

## Stunde 24: Review

Nach Ihrem ersten Tag:

- Notieren Sie Ihre verdienten Belohnungen
- Entscheiden Sie Ihre Compounding-Frequenz
- Setzen Sie eine wiederkehrende Zeit für das Teilen Ihres Referral-Links
- Planen Sie diese Woche ein Zoom-Meeting ein

Das ist das Playbook.

## Häufige Fehler am ersten Tag (vermeiden)

> [!WARN]
> 1. **Falsches Netzwerk beim Transfer** — USDT auf der falschen Chain senden
> 2. **Unendliches Spending blind freigeben** — setzen Sie ein Limit, wenn Sie unsicher sind
> 3. **Seed-Phrase nicht offline speichern** — auf Papier schreiben, physisch lagern
> 4. **Zu aggressiv compounden** — Gas-Kosten fressen kleine Einzahlungen
> 5. **Telegram-Community überspringen** — die Hilfe ist echt, kostenlos und sofort

## Kernpunkte

- Stunde 1-3: Wallet, BSC-Netzwerk, USDT, erste Einzahlung
- Stunden 4-12: System lernen, Contract verifizieren, der Community beitreten
- Stunde 13: Referral-Link holen und teilen
- Stunde 14+: Compounding-Frequenz festlegen, dann in Ruhe lassen
- Die 5 klassischen Fehler vermeiden (besonders Falsch-Netzwerk-Transfers)

Willkommen bei Turbo Loop. Die nächsten 23 Stunden sind der einfache Teil.`,
  },
  {
    parentId: 7,
    parentSlug: "why-renounced-ownership-changes-everything",
    title:
      "Warum renuncierte Ownership das Fundament von trustless DeFi ist",
    excerpt:
      "Wenn die Ownership eines Smart Contracts renunciert ist, kann niemand — weder Entwickler, noch Team, noch Angreifer — sein Verhalten ändern. Warum das wichtig ist.",
    content: `# Warum renuncierte Ownership das Fundament von trustless DeFi ist

In einem Raum, in dem Rug Pulls und Backdoor-Exploits jede Woche Schlagzeilen machen, trägt ein einziges Wort enormes Gewicht: **renunciert**. Wenn die Ownership eines Smart Contracts renunciert wurde, bedeutet das, dass die spezielle Admin-Adresse, die den Contract deployed hat, permanent auf die Null-Adresse gesetzt wurde — \`0x0000...0000\`. Niemand kann Admin-only-Funktionen aufrufen. Niemand kann den Contract upgraden. Niemand kann den LP drainen. Nicht das Team. Keine Regierung. Kein Hacker mit den privaten Schlüsseln des Teams.

Das ist das Fundament, auf dem Turbo Loop steht.

## Was Renunciation on-chain wirklich bedeutet

Jeder Smart Contract hat Funktionen. Manche sind öffentlich — jeder kann sie aufrufen (deposit, withdraw, claim). Manche sind \`onlyOwner\` — reserviert für den Contract-Deployer. In den meisten frühen Protokollen umfassen Owner-only-Funktionen Dinge wie \`setFee\`, \`pause\`, \`upgradeImplementation\`, \`migrateLiquidity\`, \`rescueTokens\`. Nützlich für ein Team, das ein junges Protokoll iteriert. Gefährlich, sobald echtes Geld drin ist.

Renunciation entfernt diese Fähigkeit für immer. Der Contract läuft genau so, wie er geschrieben wurde, ohne Möglichkeit zur Änderung.

## So verifizieren Sie Turbo Loops Renunciation

Sie müssen unserem Wort nicht vertrauen. Gehen Sie zu BscScan, fügen Sie Turbo Loops Contract-Adresse ein, klicken Sie auf "Read Contract" und scrollen Sie zu \`owner()\`. Der zurückgegebene Wert ist \`0x0000000000000000000000000000000000000000\`. Renunciert. Permanent. Von jedem Computer der Welt überprüfbar.

## Warum das für Ihre Einzahlung wichtig ist

Wenn Sie USDT in Turbo Loop einzahlen, liegen Ihre Gelder nicht in einer Wallet, mit der jemand wegspazieren kann. Sie sind in einem auditierten, renuncierten Smart Contract gesperrt, der nur auf die Regeln reagiert, die beim Deployment geschrieben wurden. Ihr Yield wächst nach diesen Regeln. Ihre Auszahlungen erfolgen nach diesen Regeln. Keine Ausnahmen.

So sieht trustless DeFi tatsächlich aus.`,
  },
  {
    parentId: 8,
    parentSlug: "lp-lock-explained-why-liquidity-security-matters",
    title: "LP-Lock erklärt: Warum gelockte Liquidität nicht verhandelbar ist",
    excerpt:
      "Ein LP-Lock ist keine Marketing-Spielerei — es ist die wichtigste Verteidigung gegen Rug Pulls. Was er genau bewirkt und wie Sie Turbo Loops LP-Lock verifizieren.",
    content: `# LP-Lock erklärt: Warum gelockte Liquidität nicht verhandelbar ist

Wenn Sie Zeit in DeFi verbracht haben, haben Sie dasselbe Muster gesehen: Ein neues Protokoll launcht mit wilden APYs, sammelt Einzahlungen ein, und eines Tages ist der Liquidity Pool leer und die Entwickler sind weg. Es ist der älteste Scam in Krypto. Die Verteidigung dagegen ist einfach, aber weit ignoriert: **den LP locken**.

## Was ist ein Liquidity Pool?

In jedem AMM-basierten DeFi-Protokoll ist der Liquidity Pool der Token-Vorrat, der den Wert des Projekts deckt. Nutzer können nur abheben, swappen und handeln, weil der LP existiert. Wenn der LP gedraint wird, können Nutzer nicht aussteigen — ihre Tokens werden wertlos.

## Was bedeutet "LP locken"?

Wenn Sie einen LP locken, werden die LP-Tokens (die Eigentum an der Liquidität repräsentieren) an einen Time-Lock-Smart-Contract gesendet, der sie bis zu einem vorbestimmten Datum weit in der Zukunft nicht freigeben kann. Oft für immer. Der Entwickler verliert die Fähigkeit, die Liquidität abzuziehen. Nutzer gewinnen Gewissheit.

Turbo Loops LP ist 100 % gelockt. Permanent.

## Den Lock verifizieren

Schlagen Sie den LP-Contract auf BscScan nach. Prüfen Sie den Inhaber der LP-Tokens. Wenn es eine Time-Lock-Contract-Adresse ist, ist der Lock echt. Wenn es eine Wallet-Adresse ist, die das Team kontrolliert, ist der "Lock" nur eine Behauptung.

## Warum "100 % gelockt" wichtig ist

Manche Protokolle locken 50 % des LP und lassen 50 % unter Team-Kontrolle. Das ist immer noch Exit-Liquidität. Nur ein 100 %-Lock eliminiert das Rug-Pull-Risiko vollständig. Turbo Loop hat 100 % gewählt, weil alles weniger eine Schwachstelle ist.

Wenn Sie irgendein DeFi-Protokoll bewerten, stellen Sie vor allem anderen eine Frage: Ist der LP zu 100 % gelockt? Wenn die Antwort nicht "ja" ist, gehen Sie weiter.`,
  },
  {
    parentId: 15,
    parentSlug: "compounding-strategy-exponential-growth",
    title: "Die Compounding-Mathematik: Warum Re-Looping besser ist als Abheben",
    excerpt:
      "Sie haben gehört, 'Zinseszins ist das achte Weltwunder.' In DeFi ist es noch mächtiger. Hier die Mathematik hinter Turbo Loops Re-Loop-Feature.",
    content: `# Die Compounding-Mathematik: Warum Re-Looping besser ist als Abheben

Einstein nannte den Zinseszins angeblich "das achte Weltwunder". In der traditionellen Finanzwelt findet Compounding langsam statt — einmal pro Quartal, vielleicht täglich. In DeFi können Sie **bei jedem Claim** compounden. Mit Turbo Loops Re-Loop-Feature ist Compounding ein Klick.

## Die Grundrechnung

Angenommen, Sie zahlen 1.000 $ ein und verdienen 1 % Yield pro Tag. Nach 30 Tagen:

- **Ohne Compounding** (Yield abheben): Sie verdienen 1 $ × 30 = 30 $. Saldo: 1.030 $.
- **Mit täglichem Compounding** (Re-Loop): 1.000 $ × (1,01)^30 = 1.347,85 $. Das sind 347 $ in 30 Tagen.

Das ist ein 11-facher Unterschied beim Verdienst — aus demselben Startkapital, über denselben Zeitraum — nur durch die Entscheidung zu compounden.

## Warum Compounding so mächtig ist

Der Yield jedes Tages wird zu neuem Kapital, das am nächsten Tag Yield generiert. Das Kapital wächst geometrisch, nicht arithmetisch. Je länger Sie compounden, desto größer wird die Lücke zwischen Compounding und Abheben.

## Turbo Loops Re-Loop-Feature

Vom Main Dashboard reinvestiert ein einziger Button Ihren aufgelaufenen Yield zurück in den Farming-Contract. Kein manuelles Abheben + Re-Deposit. Kein gas-intensiver Workflow. Ein Klick, compounded.

## Strategische Überlegungen

Die meisten ernsthaften Turbo-Loop-Nutzer re-loopen täglich. Manche re-loopen wöchentlich, um Gas zu sparen. Einige heben ab, um Lebenshaltungskosten zu decken, während sie eine Basis-Position compoundend lassen. Es gibt keine einzig richtige Strategie — aber mathematisch gilt: Je länger Sie Yield compounden lassen, desto größer wird Ihre eventuelle Position.

Compounding ist der Unterschied zwischen "Ich habe ein bisschen aus Krypto verdient" und "Krypto hat meine finanzielle Bahn verändert". Es belohnt Geduld und Disziplin — deshalb ist es eines der wichtigsten Werkzeuge im Repertoire eines DeFi-Nutzers.`,
  },
  {
    parentId: 16,
    parentSlug: "the-100k-smart-contract-challenge",
    title: "Die 100.000-$-Smart-Contract-Challenge: Eine offene Wette auf Sicherheit",
    excerpt:
      "Turbo Loop bietet 100.000 $ für jeden, der eine Schwachstelle oder einen Zentralisierungs-Beweis findet. Das ist nicht nur ein Bounty — es ist eine öffentliche Vertrauenserklärung.",
    content: `# Die 100.000-$-Smart-Contract-Challenge: Eine offene Wette auf Sicherheit

Viele Projekte behaupten, ihre Smart Contracts seien sicher. Turbo Loop ist bereit, 100.000 $ darauf zu setzen.

Die **100K Smart Contract Challenge** ist ein einfaches Angebot: finden Sie eine Schwachstelle, finden Sie eine zentralisierte Funktion, finden Sie irgendeinen Weg, Gelder zu drainen oder Verhalten zu ändern, reichen Sie den Beweis ein und beanspruchen Sie 100.000 USDT. Öffentlich. Offen. Unbefristet.

## Was qualifiziert

- Eine Schwachstelle im bereitgestellten Smart Contract, die das Drainen oder Sperren von Geldern erlaubt.
- Jeder Beweis von Zentralisierung (eine Owner-only-Funktion, ein versteckter Admin-Schlüssel, eine Backdoor).
- Ein Weg, Yield-Berechnungen, Referral-Auszahlungen oder Leadership-Rank-Progression zu manipulieren.

## Wie man beansprucht

- Die Schwachstelle muss on-chain demonstrierbar sein (nicht theoretisch).
- Die Einreichung muss einen reproduzierbaren Proof of Concept enthalten.
- Drittparteien-Auditoren verifizieren den Anspruch.
- Bei Gültigkeit werden 100.000 USDT an die Wallet des Einreichers ausgezahlt.

## Warum das wichtig ist

Ein Bug-Bounty ist in Web2 üblich (Unternehmen bezahlen Hacker, um Bugs zu finden, bevor bösartige Hacker es tun). Eine öffentliche Zentralisierungs-Challenge ist in DeFi selten. Die meisten Projekte behalten leise Admin-Privilegien und hoffen, dass niemand es bemerkt. Turbo Loop lädt zur Prüfung ein und untermauert diese Einladung mit einer sechsstelligen Belohnung.

## Was wir bisher gesehen haben

Seit die Challenge angekündigt wurde, gab es null gültige Ansprüche. Nicht weil Sicherheitsforscher nicht suchen — sondern weil der Contract renunciert ist, der LP gelockt und die auditierte Logik keine ausnutzbaren Schwachstellen hat. Das ist das praktische Ergebnis davon, von Tag eins an trustless zu bauen.

Die Challenge bleibt offen. Für immer. Wenn Sie Sicherheitsforscher sind, bitte versuchen Sie es. Wir wollen, dass Sie es tun.`,
  },
  {
    parentId: 17,
    parentSlug: "why-stablecoin-yields-matter",
    title: "Warum Stablecoin-Renditen wichtiger sind als je zuvor",
    excerpt:
      "In volatilen Märkten ist Yield auf einem Stablecoin der einzige Yield, der wirklich etwas bedeutet. Warum Turbo Loops USDT-basiertes Modell für jeden Zyklus geeignet ist.",
    content: `# Warum Stablecoin-Renditen wichtiger sind als je zuvor

Krypto-Renditen auf volatilen Assets sehen auf einem Spreadsheet großartig aus — bis der Token-Preis um 60 % fällt. Dann hat Ihre "50 % APY", verdient auf einem an Wert verlierenden Asset, Sie schlechter dastehen lassen als das Halten von Stablecoins. Das ist das schmutzige Geheimnis des meisten DeFi-Farmings: Der Yield ist oft geringer als die Abwertung des Assets, das ihn verdient.

Turbo Loop umgeht das vollständig, indem es Stablecoin-basiert ist.

## Das USDT-Yield-Modell

Sie zahlen USDT ein. Sie verdienen Yield in USDT. Wenn Sie abheben, bekommen Sie USDT. Zu keinem Zeitpunkt hängen Ihr Kapital oder Yield vom BNB-Preis, vom Preis eines nativen Turbo-Loop-Tokens oder von einem anderen volatilen Asset ab. Der Yield ist echter Yield, verdient in einer Recheneinheit, die nicht fällt.

## Warum das selten ist

Die meisten Farming-Protokolle zahlen Yield in ihrem eigenen emittierten Token. Der Preis dieses Tokens kollabiert, sobald frühe Farmer ihre Belohnungen verkaufen und damit den Yield für spätere Farmer verwässern. Die nummerische APY bleibt hoch. Der in Dollar denominierte Yield bricht ein.

## Yield-Quelle ist wichtiger als Yield-Zahl

Eine 30 % APY, die aus echten Protokollerlösen (Swap-Gebühren, Protokollgebühren) gespeist wird, ist mehr wert als eine 300 % APY, die aus neu geminteten Emissionen kommt, die niemand will. Turbo Loops Yield wird gespeist aus:

- LP-Rewards aus dem USDC/USDT-Pool
- Turbo-Swap-Gebühren (0,3 % pro Transaktion)
- Turbo-Buy-Gebühren (Fiat-zu-Krypto-Konvertierung)

Alle drei sind in stabilem Wert denominiert und werden in stabilem Wert ausgezahlt. Der Yield ist stabiler Yield.

## Was das für Nutzer bedeutet

Im Bullenmarkt fangen Sie das Upside in der breiteren Krypto-Allokation ab, die Sie ohnehin halten. Im Bärenmarkt verdient Ihre Turbo-Loop-Position weiter Yield in USDT, während alles andere fällt. Stablecoin-basierter Yield ist by design marktzyklus-unabhängig.

Deshalb behandeln sophistizierte Nutzer Stablecoin-Yield-Protokolle wie Turbo Loop als Basis-Layer ihres Krypto-Portfolios — der Teil, der unabhängig davon verdient, wohin der Markt geht.`,
  },
  {
    parentId: 22,
    parentSlug: "what-to-watch-for-in-a-defi-project",
    title: "7 Fragen, die Sie vor jeder DeFi-Einzahlung stellen sollten",
    excerpt:
      "Die meisten Leute überspringen diese Fragen und verlieren Geld. Sieben Checks, die nachhaltige Protokolle von Rug Pulls trennen.",
    content: `# 7 Fragen, die Sie vor jeder DeFi-Einzahlung stellen sollten

Tausende DeFi-Protokolle launchen jedes Jahr. Die meisten scheitern. Eine Handvoll gedeiht. Der Unterschied zwischen beiden ist normalerweise sichtbar — wenn Sie wissen, wonach Sie schauen. Hier sind die sieben Fragen, die jeder ernsthafte DeFi-Nutzer durchläuft, bevor er einen einzigen Dollar einzahlt.

## 1. Ist der Contract auditiert?

Und — ist der Audit-Report öffentlich? Wenn das Team das Audit nicht teilt, gibt es keines. Lesen Sie die tatsächlichen Findings, nicht nur die Zusammenfassung.

## 2. Ist die Ownership renunciert?

Prüfen Sie \`owner()\` auf BscScan/Etherscan. Wenn es eine Wallet-Adresse ist, die das Team kontrolliert, können sie den Contract modifizieren. Wenn es \`0x00...00\` ist, ist der Contract immutable. **Keine Ausnahmen.**

## 3. Ist der LP gelockt? Wie lange? Wo?

"Gelockt" kann verschiedene Dinge bedeuten. Fragen Sie: wie viel ist gelockt, für wie lange und in welchem Lock-Contract. On-chain verifizieren. Kurze Locks (unter 1 Jahr) sind Warnsignale.

## 4. Woher kommt der Yield?

Wenn die Antwort "neue Einzahlungen" oder "Token-Emissionen" ist, ist das Modell unhaltbar. Suchen Sie nach echtem Protokollerlös: Swap-Gebühren, Handelsgebühren, externem Einkommen.

## 5. Wer ist im Team?

Anonyme Teams sind nicht automatisch schlecht, aber sie erhöhen die Latte bei allem anderen (Code, Audits, Track Record). Suchen Sie nach verifizierbarer Team-Historie — frühere Projekte, öffentliche Präsenz, Zeit beim Bauen.

## 6. Wie sieht die Community aus?

Echt, engagiert, regional verteilt? Oder bot-gefüllt, shillig, in einer Sprache konzentriert? Gesunde Communities sind divers und stellen schwierige Fragen. Schauen Sie Telegram zu einer zufälligen Tageszeit an.

## 7. Können Sie aussteigen?

Manche Protokolle haben hohe Einzahlungsgebühren, Auszahlungsgebühren oder lange Sperrfristen, getarnt als "Vesting". Lesen Sie den Contract. Stellen Sie sicher, dass Sie das, was Sie eingezahlt haben, jederzeit abheben können.

## Wie Turbo Loop bei diesen sieben abschneidet

1. ✅ Auditiert. Report öffentlich.
2. ✅ Ownership renunciert.
3. ✅ LP zu 100 % gelockt.
4. ✅ Yield aus LP-Rewards, Turbo-Swap-Gebühren, Turbo-Buy-Gebühren — alles echter Erlös.
5. ✅ Track Record, öffentliche Team-Historie.
6. ✅ Community auf 6 Kontinenten, 12+ Sprachen, 50+ Ländern.
7. ✅ Keine Auszahlungsgebühren. Jederzeit aussteigen.

Sieben aus sieben. So sieht ein echtes DeFi-Protokoll aus.`,
  },
  {
    parentId: 30,
    parentSlug: "verifying-a-defi-contract-on-bscscan",
    title: "Einen DeFi-Contract auf BscScan verifizieren (Schritt für Schritt)",
    excerpt:
      "Jede Behauptung, die Turbo Loop aufstellt, ist auf BscScan überprüfbar. Hier ist genau, wie Sie jede einzelne prüfen — dauert weniger als 5 Minuten.",
    content: `# Einen DeFi-Contract auf BscScan verifizieren (Schritt für Schritt)

Der beste Weg, vertrauenswürdige DeFi-Protokolle von zwielichtigen zu trennen, ist, die Blockchain selbst zu lesen. BscScan macht das einfach — sogar für nicht-technische Nutzer. Hier eine Schritt-für-Schritt-Anleitung, wie Sie Turbo Loop (oder jedes Protokoll) Behauptung für Behauptung verifizieren.

## Schritt 1: Die Contract-Adresse finden

Jedes Protokoll veröffentlicht seine Contract-Adresse. Turbo Loops Adresse steht in der App, in den Docs, in gepinnten Telegram-Nachrichten. Kopieren Sie sie.

## Schritt 2: Zu BscScan gehen

Öffnen Sie bscscan.com. Fügen Sie die Contract-Adresse in die Suchleiste ein. Enter drücken.

## Schritt 3: Quellcode-Sichtbarkeit prüfen

Auf der Contract-Seite klicken Sie auf den **Contract**-Tab. Wenn der Code verifiziert ist, sehen Sie den Solidity-Quellcode direkt auf der Seite. Wenn dort "Contract Source Code Not Verified" steht, ist das eine rote Flagge — das Team versteckt etwas. Turbo Loops Code ist vollständig sichtbar.

## Schritt 4: Ownership prüfen

Klicken Sie auf den **Read Contract**-Subtab. Scrollen Sie zu \`owner()\`. Klicken Sie darauf. Der zurückgegebene Wert sollte \`0x0000000000000000000000000000000000000000\` sein — die Null-Adresse. Wenn es eine andere Adresse ist, hat der Contract einen Owner, der ihn modifizieren kann. Turbo Loops gibt \`0x00...00\` zurück.

## Schritt 5: LP-Lock prüfen

Das benötigt die LP-Token-Adresse (separat vom Hauptcontract). Normalerweise in den Docs gelistet. Fügen Sie sie in BscScan ein. Finden Sie die Holders-Liste. Ein großer Prozentsatz (100 %, idealerweise) sollte von einem bekannten Time-Lock-Contract gehalten werden (nicht von einer Team-Wallet). Klicken Sie auf den Lock-Contract und verifizieren Sie die Unlock-Zeit — sie sollte weit in der Zukunft oder \`uint256.max\` sein.

## Schritt 6: Aktuelle Aktivität prüfen

Auf der Hauptcontract-Seite zeigt der Transactions-Tab jede Interaktion. Gesunde Protokolle haben kontinuierliche, echte Nutzeraktivität. Leere oder bot-dominierte Transaktionshistorie ist verdächtig.

## Schritt 7: Total Value Locked prüfen

Rufen Sie die \`totalDeposits\`- oder \`totalValueLocked\`-Funktion des Contracts auf Read Contract auf. Konvertieren Sie von Wei in menschenlesbar (durch 10^18 teilen). Vergleichen Sie mit der TVL, die das Projekt auf seiner Website angibt. Sie sollten übereinstimmen.

## Machen Sie das vor jeder Einzahlung

Es dauert 5 Minuten. Es schützt Sie vor 100 % der Wege, auf denen DeFi schiefgeht. Das ist, was "trustless" in der Praxis bedeutet — nicht vertrauen, sondern verifizieren.`,
  },
];

// Reading time computation matching the 0004 migration's backfill (230
// wpm). GREATEST(1, ...) ensures a stub never shows "0 min read".
function readingTimeMin(content) {
  const words = content.replace(/\s+/g, " ").trim().split(" ").length;
  return Math.max(1, Math.ceil(words / 230));
}

(async () => {
  console.log(`Seeding ${TRANSLATIONS.length} German backfill translations…\n`);
  let inserted = 0;
  let skipped = 0;
  for (const t of TRANSLATIONS) {
    const slug = `${t.parentSlug}-de`;
    const rt = readingTimeMin(t.content);
    const result = await sql`
      INSERT INTO blog_posts
        (title, slug, excerpt, content, language, published,
         translation_of, reading_time_min)
      VALUES
        (${t.title}, ${slug}, ${t.excerpt}, ${t.content}, 'de', true,
         ${t.parentId}, ${rt})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    `;
    if (result.length > 0) {
      console.log(`  ✓ inserted ${slug} (id=${result[0].id}, ${rt} min read)`);
      inserted++;
    } else {
      console.log(`  · ${slug} already exists — preserved`);
      skipped++;
    }
  }
  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);

  // Sanity-check the linkage
  const linked = await sql`
    SELECT COUNT(*)::int AS n
    FROM blog_posts
    WHERE language = 'de' AND translation_of IS NOT NULL
  `;
  console.log(`Total DE translations now linked to parent: ${linked[0].n}`);
})().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
