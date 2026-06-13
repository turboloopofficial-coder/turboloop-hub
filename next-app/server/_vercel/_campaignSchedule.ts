// Campaign Creative Schedule — 12 hourly slots filling the 24-posts/day cadence
// Each slot picks a deterministic image (dayIndex % categorySize) and its
// unique caption from CAMPAIGN_COPY, then appends the live $TURBO price.
//
// R2 path: campaigns/{category}/{filename}
// Captions: one unique caption per image, never repeating within the category cycle.

import { CAMPAIGN_COPY } from "./_campaignCaptions";

const R2 = "https://pub-1d13f4e7ccfa4575bc04b75045f1b1b1.r2.dev";

export function campaignImageUrl(category: string, filename: string): string {
  return `${R2}/campaigns/${category}/${filename}`;
}

// File lists per category (sorted, deterministic)
const CAMPAIGN_FILES: Record<string, string[]> = {
  "buyback": [
    "01_Buyback_Daily_Execution.png","02_Buyback_On_Chain_Proof.png","03_Buyback_Scarcity_Engine.png",
    "04_Buyback_Fee_Flow.png","05_Buyback_Daily_Schedule.png","06_Buyback_Price_Support.png",
    "07_Buyback_Trustless.png","08_Buyback_Community_Benefit.png","09_Buyback_Vs_Inflation.png",
    "10_Buyback_Compound_Effect.png","11_Buyback_Token_Burn.png","12_Buyback_Transparent_Wallet.png",
    "13_Buyback_Demand_Shock.png","14_Buyback_Whale_Defense.png","15_Buyback_Yield_Reinforce.png",
    "16_Buyback_Ecosystem_Health.png","17_Buyback_Holder_Reward.png","18_Buyback_Smart_Contract.png",
    "19_Buyback_Volume_Spike.png","20_Buyback_Deflationary_Loop.png","21_Buyback_Treasury_Funded.png",
    "22_Buyback_Token_Velocity.png","23_Buyback_Price_Floor.png","24_Buyback_Quarterly_Report.png",
    "25_Buyback_Community_Vote.png","26_Buyback_Milestone.png","27_Buyback_Liquidity_Depth.png",
    "28_Buyback_Anti_Dump.png","29_Buyback_Accumulation_Zone.png","30_Buyback_Legacy_Build.png",
  ],
  "community": [
    "01_Community_Global_Family.png","02_Community_Telegram_Growth.png","03_Community_Leaderboard.png",
    "04_Community_Ambassador.png","05_Community_Referral_Network.png","06_Community_Meetup.png",
    "07_Community_Milestone_1000.png","08_Community_Country_Leaders.png","09_Community_Support_24_7.png",
    "10_Community_Language_Kit.png","11_Community_Social_Wall.png","12_Community_Discord.png",
    "13_Community_Builder_Rank.png","14_Community_Director_Rank.png","15_Community_Legend_Rank.png",
    "16_Community_First_Withdrawal.png","17_Community_Onboarding.png","18_Community_Celebrate.png",
    "19_Community_Team_Africa.png","20_Community_Team_India.png","21_Community_Team_Europe.png",
    "22_Community_Team_LATAM.png","23_Community_Team_SEA.png","24_Community_Team_MENA.png",
    "25_Community_Voices.png","26_Community_Testimonials.png","27_Community_Anniversary.png",
    "28_Community_Charity.png","29_Community_Education_Hub.png","30_Community_Future_Vision.png",
  ],
  "comparison": [
    "01_Comparison_Vs_Bank.png","02_Comparison_Vs_Stocks.png","03_Comparison_Vs_Crypto.png",
    "04_Comparison_Vs_Real_Estate.png","05_Comparison_Vs_Savings.png","06_Comparison_Vs_Gold.png",
    "07_Comparison_Vs_FD.png","08_Comparison_Vs_Mutual_Fund.png","09_Comparison_Vs_P2P.png",
    "10_Comparison_Vs_Staking.png","11_Comparison_Vs_Yield_Farm.png","12_Comparison_Vs_CEX.png",
    "13_Comparison_Vs_Inflation.png","14_Comparison_Vs_Pension.png","15_Comparison_Vs_Bonds.png",
    "16_Comparison_Vs_NFT.png","17_Comparison_Vs_Meme_Coin.png","18_Comparison_Vs_VC.png",
    "19_Comparison_Vs_Angel.png","20_Comparison_Vs_Crowdfund.png","21_Comparison_Vs_REIT.png",
    "22_Comparison_Vs_Annuity.png","23_Comparison_Vs_Insurance.png","24_Comparison_Vs_Forex.png",
    "25_Comparison_Vs_Options.png","26_Comparison_Vs_Futures.png","27_Comparison_Vs_ETF.png",
    "28_Comparison_Vs_Index_Fund.png","29_Comparison_Vs_Hedge_Fund.png","30_Comparison_Vs_Nothing.png",
  ],
  "education-defi": [
    "01_DeFi_What_Is_DeFi.png","02_DeFi_Smart_Contracts.png","03_DeFi_Blockchain_Basics.png",
    "04_DeFi_Liquidity_Pool.png","05_DeFi_Yield_Farming.png","06_DeFi_Staking_Explained.png",
    "07_DeFi_BSC_Network.png","08_DeFi_Gas_Fees.png","09_DeFi_Wallet_Setup.png",
    "10_DeFi_PancakeSwap.png","11_DeFi_Token_Economics.png","12_DeFi_APY_Vs_APR.png",
    "13_DeFi_Impermanent_Loss.png","14_DeFi_Rug_Pull_Warning.png","15_DeFi_DYOR.png",
    "16_DeFi_On_Chain_Analytics.png","17_DeFi_Audit_Explained.png","18_DeFi_Multisig.png",
    "19_DeFi_DAO_Governance.png","20_DeFi_Flash_Loans.png","21_DeFi_Bridges.png",
    "22_DeFi_Layer2.png","23_DeFi_Oracles.png","24_DeFi_NFT_Finance.png",
    "25_DeFi_Real_World_Assets.png","26_DeFi_Stablecoins.png","27_DeFi_CBDC_Vs_DeFi.png",
    "28_DeFi_Privacy_Coins.png","29_DeFi_ZK_Proofs.png","30_DeFi_Future_Finance.png",
    "31_DeFi_Compound_Interest.png","32_DeFi_Time_Value.png","33_DeFi_Risk_Management.png",
    "34_DeFi_Portfolio_Diversify.png","35_DeFi_Dollar_Cost_Average.png","36_DeFi_Passive_Income.png",
    "37_DeFi_Financial_Freedom.png","38_DeFi_Web3_Intro.png","39_DeFi_Metaverse_Finance.png",
    "40_DeFi_Crypto_Tax.png",
  ],
  "hindi-new": [
    "01_Hindi_Welcome.png","02_Hindi_Daily_Returns.png","03_Hindi_How_It_Works.png",
    "04_Hindi_Plans_Overview.png","05_Hindi_Referral_System.png","06_Hindi_Withdraw_Anytime.png",
    "07_Hindi_Security_Audit.png","08_Hindi_Smart_Contract.png","09_Hindi_Liquidity_Lock.png",
    "10_Hindi_Token_Info.png","11_Hindi_Compounding.png","12_Hindi_Calculator.png",
    "13_Hindi_Success_Story.png","14_Hindi_Community.png","15_Hindi_Telegram_Join.png",
    "16_Hindi_Roadmap.png","17_Hindi_Team.png","18_Hindi_FAQ.png",
    "19_Hindi_Transparency.png","20_Hindi_Buyback.png","21_Hindi_Burn.png",
    "22_Hindi_Ecosystem.png","23_Hindi_Films.png","24_Hindi_Zoom.png",
    "25_Hindi_Ambassador.png","26_Hindi_Rank_System.png","27_Hindi_Passive_Income.png",
    "28_Hindi_Financial_Freedom.png","29_Hindi_Start_Today.png","30_Hindi_Get_Started.png",
    "31_Hindi_Morning_Motivation.png","32_Hindi_Evening_Update.png","33_Hindi_Weekend_Special.png",
    "34_Hindi_Monthly_Goal.png","35_Hindi_Annual_Target.png","36_Hindi_Family_Plan.png",
    "37_Hindi_Student_Earner.png","38_Hindi_Housewife_Income.png","39_Hindi_Farmer_DeFi.png",
    "40_Hindi_Freelancer.png","41_Hindi_Salaried_Person.png","42_Hindi_Business_Owner.png",
    "43_Hindi_Retired_Income.png","44_Hindi_Youth_Crypto.png","45_Hindi_Women_Finance.png",
    "46_Hindi_Rural_Access.png","47_Hindi_Urban_DeFi.png","48_Hindi_NRI_Opportunity.png",
    "49_Hindi_Diwali_Special.png","50_Hindi_New_Year.png",
  ],
  "lifestyle": [
    "01_Lifestyle_Beach_Freedom.png","02_Lifestyle_Morning_Coffee_Earnings.png","03_Lifestyle_Work_From_Anywhere.png",
    "04_Lifestyle_Travel_While_Earning.png","05_Lifestyle_Laptop_Lifestyle.png","06_Lifestyle_Sunset_Passive.png",
    "07_Lifestyle_Mountain_Retreat.png","08_Lifestyle_City_Penthouse.png","09_Lifestyle_Family_Time.png",
    "10_Lifestyle_Weekend_Free.png","11_Lifestyle_No_Alarm_Clock.png","12_Lifestyle_Dream_Car.png",
    "13_Lifestyle_Dream_Home.png","14_Lifestyle_Kids_Education.png","15_Lifestyle_Parents_Care.png",
    "16_Lifestyle_Health_Wealth.png","17_Lifestyle_Gym_Earner.png","18_Lifestyle_Yoga_Income.png",
    "19_Lifestyle_Chef_Passive.png","20_Lifestyle_Artist_DeFi.png","21_Lifestyle_Musician_Yield.png",
    "22_Lifestyle_Photographer_Earn.png","23_Lifestyle_Gamer_Income.png","24_Lifestyle_Streamer_Yield.png",
    "25_Lifestyle_Influencer_DeFi.png","26_Lifestyle_Entrepreneur_Free.png","27_Lifestyle_Digital_Nomad.png",
    "28_Lifestyle_Island_Life.png","29_Lifestyle_Ski_Resort.png","30_Lifestyle_Safari_Earner.png",
    "31_Lifestyle_Cruise_Income.png","32_Lifestyle_Spa_Day_Passive.png","33_Lifestyle_Golf_Yield.png",
    "34_Lifestyle_Yacht_DeFi.png","35_Lifestyle_Private_Jet.png","36_Lifestyle_Fine_Dining.png",
    "37_Lifestyle_Art_Collection.png","38_Lifestyle_Wine_Cellar.png","39_Lifestyle_Book_Club.png",
    "40_Lifestyle_Meditation_Earn.png","41_Lifestyle_Sunrise_Wealth.png","42_Lifestyle_Stargazing_Income.png",
    "43_Lifestyle_Garden_Passive.png","44_Lifestyle_Farm_DeFi.png","45_Lifestyle_Village_Freedom.png",
    "46_Lifestyle_City_Walk.png","47_Lifestyle_Night_Out.png","48_Lifestyle_Festival_Earn.png",
    "49_Lifestyle_Birthday_Passive.png","50_Lifestyle_Legacy_Build.png",
  ],
  "nigerian": [
    "01_Nigeria_Welcome.png","02_Nigeria_Daily_Returns.png","03_Nigeria_How_It_Works.png",
    "04_Nigeria_Plans_Overview.png","05_Nigeria_Referral_System.png","06_Nigeria_Withdraw_Anytime.png",
    "07_Nigeria_Security.png","08_Nigeria_Smart_Contract.png","09_Nigeria_Liquidity_Lock.png",
    "10_Nigeria_Token_Info.png","11_Nigeria_Compounding.png","12_Nigeria_Calculator.png",
    "13_Nigeria_Success_Story.png","14_Nigeria_Community.png","15_Nigeria_Telegram_Join.png",
    "16_Nigeria_Roadmap.png","17_Nigeria_Team.png","18_Nigeria_FAQ.png",
    "19_Nigeria_Transparency.png","20_Nigeria_Buyback.png","21_Nigeria_Burn.png",
    "22_Nigeria_Ecosystem.png","23_Nigeria_Films.png","24_Nigeria_Zoom.png",
    "25_Nigeria_Ambassador.png","26_Nigeria_Rank_System.png","27_Nigeria_Passive_Income.png",
    "28_Nigeria_Financial_Freedom.png","29_Nigeria_Start_Today.png","30_Nigeria_Get_Started.png",
    "31_Nigeria_Lagos_Earner.png","32_Nigeria_Abuja_Passive.png","33_Nigeria_PH_Income.png",
    "34_Nigeria_Kano_DeFi.png","35_Nigeria_Ibadan_Yield.png","36_Nigeria_Enugu_Earner.png",
    "37_Nigeria_Benin_Passive.png","38_Nigeria_Warri_Income.png","39_Nigeria_Calabar_DeFi.png",
    "40_Nigeria_Owerri_Yield.png","41_Nigeria_Student_Earner.png","42_Nigeria_Graduate_Income.png",
    "43_Nigeria_Market_Trader.png","44_Nigeria_Farmer_DeFi.png","45_Nigeria_Artisan_Yield.png",
    "46_Nigeria_Civil_Servant.png","47_Nigeria_Entrepreneur.png","48_Nigeria_Diaspora.png",
    "49_Nigeria_Independence.png","50_Nigeria_Future_Vision.png",
  ],
  "objection-handler": [
    "01_Objection_Is_It_A_Scam.png","02_Objection_Too_Good_True.png","03_Objection_Not_Regulated.png",
    "04_Objection_Crypto_Risky.png","05_Objection_Lost_Before.png","06_Objection_No_Time.png",
    "07_Objection_Dont_Understand.png","08_Objection_Need_More_Research.png","09_Objection_Small_Amount.png",
    "10_Objection_No_Wallet.png","11_Objection_Tax_Issues.png","12_Objection_Family_Disapproves.png",
    "13_Objection_Already_In_Stocks.png","14_Objection_Wait_For_Dip.png","15_Objection_Market_Down.png",
    "16_Objection_Inflation_Fear.png","17_Objection_Rug_Pull_Fear.png","18_Objection_Team_Anonymous.png",
    "19_Objection_No_Audit.png","20_Objection_Liquidity_Lock.png","21_Objection_Smart_Contract_Bug.png",
    "22_Objection_Withdrawal_Issues.png","23_Objection_Customer_Support.png","24_Objection_Language_Barrier.png",
    "25_Objection_KYC_Privacy.png","26_Objection_Min_Deposit.png","27_Objection_Gas_Fees.png",
    "28_Objection_Network_Congestion.png","29_Objection_Competitor_Better.png","30_Objection_Wait_Bull_Run.png",
    "31_Objection_Need_Guarantee.png","32_Objection_Ponzi_Fear.png","33_Objection_Referral_MLM.png",
    "34_Objection_Exit_Scam.png","35_Objection_Dev_Dump.png","36_Objection_Token_Worthless.png",
    "37_Objection_No_Utility.png","38_Objection_Centralized_Risk.png","39_Objection_Oracle_Manipulation.png",
    "40_Objection_Flash_Loan_Attack.png","41_Objection_Regulatory_Ban.png","42_Objection_CBDC_Replace.png",
    "43_Objection_Internet_Required.png","44_Objection_Phone_Required.png","45_Objection_Bank_Block.png",
    "46_Objection_USDT_Stable.png","47_Objection_BNB_Needed.png","48_Objection_Referral_Required.png",
    "49_Objection_Withdrawal_Tax.png","50_Objection_Final_Answer.png",
  ],
  "referral": [
    "01_Referral_20_Levels.png","02_Referral_Level1_10pct.png","03_Referral_Level2_5pct.png",
    "04_Referral_Level3_3pct.png","05_Referral_Deep_Network.png","06_Referral_Daily_Income.png",
    "07_Referral_Passive_Network.png","08_Referral_Team_Builder.png","09_Referral_Ambassador.png",
    "10_Referral_Director_Rank.png","11_Referral_Legend_Rank.png","12_Referral_Turbo_Partner.png",
    "13_Referral_First_Referral.png","14_Referral_10_Referrals.png","15_Referral_100_Referrals.png",
    "16_Referral_Network_Income.png","17_Referral_Compound_Network.png","18_Referral_Global_Team.png",
    "19_Referral_India_Team.png","20_Referral_Nigeria_Team.png","21_Referral_Africa_Team.png",
    "22_Referral_Europe_Team.png","23_Referral_Asia_Team.png","24_Referral_LATAM_Team.png",
    "25_Referral_Link_Share.png","26_Referral_QR_Code.png","27_Referral_Social_Share.png",
    "28_Referral_Telegram_Invite.png","29_Referral_WhatsApp_Share.png","30_Referral_Twitter_Share.png",
    "31_Referral_Facebook_Share.png","32_Referral_Instagram_Share.png","33_Referral_YouTube_Share.png",
    "34_Referral_TikTok_Share.png","35_Referral_Email_Invite.png","36_Referral_SMS_Invite.png",
    "37_Referral_Business_Card.png","38_Referral_Flyer.png","39_Referral_Webinar.png",
    "40_Referral_Meetup.png","41_Referral_Family_Plan.png","42_Referral_Friends_Plan.png",
    "43_Referral_Colleagues_Plan.png","44_Referral_Church_Group.png","45_Referral_School_Group.png",
    "46_Referral_Online_Community.png","47_Referral_Crypto_Group.png","48_Referral_Forex_Group.png",
    "49_Referral_Investment_Club.png","50_Referral_Legacy_Network.png",
  ],
  "success-story": [
    "01_Success_First_Withdrawal.png","02_Success_First_Referral.png","03_Success_Paid_Off_Debt.png",
    "04_Success_Community_Milestone.png","05_Success_New_Car.png","06_Success_Turbo_Legend_Rank.png",
    "07_Success_Family_Vacation.png","08_Success_60_Day_Plan_Complete.png","09_Success_Team_Builder.png",
    "10_Success_Student_Earner.png","11_Success_Retired_Parent.png","12_Success_Ambassador_Rank.png",
    "13_Success_From_Zero.png","14_Success_30_Day_Plan.png","15_Success_Global_Earner.png",
    "16_Success_Accelerator_Rank.png","17_Success_Passive_Income_Dashboard.png","18_Success_Housewife_Earner.png",
    "19_Success_First_Month.png","20_Success_Farmer_DeFi.png","21_Success_Director_Rank.png",
    "22_Success_Bought_House.png","23_Success_Builder_Rank.png","24_Success_Freelancer_Freedom.png",
    "25_Success_Executive_Rank.png","26_Success_Turbo_Partner_Start.png","27_Success_Multiple_Plans.png",
    "28_Success_Community_Leader.png","29_Success_7_Day_Quick_Win.png","30_Success_Year_One.png",
    "31_Success_14_Day_Plan.png","32_Success_Network_Income_Day.png","33_Success_Couple_Financial_Freedom.png",
    "34_Success_Reinvest_Compound.png","35_Success_Financial_Independence.png","36_Success_Passive_While_Traveling.png",
    "37_Success_Referral_Income_Surprise.png","38_Success_Consistent_Earner.png","39_Success_Crypto_Journey.png",
    "40_Success_Final_Legacy.png",
  ],
  "token": [
    "01_Token_Launch_Story.png","02_TURBO_Buyback_Daily.png","03_TURBO_Vesting_Schedule.png",
    "04_TURBO_Fixed_Supply.png","05_TURBO_Burn_Wallet.png","06_TURBO_PancakeSwap.png",
    "07_TURBO_Native_Swap.png","08_TURBO_Power_Plan_Rewards.png","09_TURBO_Ultimate_Plan_Gold.png",
    "10_TURBO_All_Time_Performance.png","11_TURBO_Tokenomics_Overview.png","12_TURBO_Liquidity_Lock.png",
    "13_TURBO_Smart_Contract_Audit.png","14_TURBO_BSC_Network.png","15_TURBO_Holder_Rewards.png",
    "16_TURBO_Token_Utility.png","17_TURBO_Price_Discovery.png","18_TURBO_Governance_Power.png",
    "19_TURBO_Staking_Yield.png","20_TURBO_Ecosystem_Growth.png","21_TURBO_Anti_Whale.png",
    "22_TURBO_Deflationary_Model.png","23_TURBO_Rank_Journey.png","24_TURBO_Legend_Rank.png",
    "25_TURBO_Token_Launch_BSC.png","26_TURBO_Transparent_Protocol.png","27_TURBO_Compound_Power.png",
    "28_TURBO_USDT_Pool.png","29_TURBO_60Day_Plan.png","30_TURBO_30Day_Plan.png",
    "31_TURBO_14Day_Plan.png","32_TURBO_7Day_Plan.png","33_TURBO_Min_Deposit.png",
    "34_TURBO_Daily_Rewards.png","35_TURBO_Network_Income.png","36_TURBO_Smart_Contract_Power.png",
    "37_TURBO_Passive_Income.png","38_TURBO_Withdraw_Anytime.png","39_TURBO_Referral_Level1.png",
    "40_TURBO_DeFi_Future.png","41_TURBO_All_Plans_Overview.png","42_TURBO_Security_First.png",
    "43_TURBO_No_IL_Risk.png","44_TURBO_Daily_UTC_Rewards.png","45_TURBO_Compound_Network.png",
    "46_TURBO_Global_Access.png","47_TURBO_Trustless_Finance.png","48_TURBO_Earn_While_Sleep.png",
    "49_TURBO_Join_Revolution.png","50_TURBO_Start_Now.png",
  ],
  "urgency": [
    "01_Urgency_Every_Day_Counts.png","02_Urgency_Your_Friends_Started.png","03_Urgency_Compound_Starts_Now.png",
    "04_Urgency_Inflation_Eating_Cash.png","05_Urgency_7_Day_Plan_Running.png","06_Urgency_Opportunity_Window.png",
    "07_Urgency_Missed_Gains.png","08_Urgency_Early_Adopter.png","09_Urgency_24_Hours.png",
    "10_Urgency_Regret_Is_Expensive.png","11_Urgency_Global_Race.png","12_Urgency_Sleeping_Money.png",
    "13_Urgency_Next_Bull_Run.png","14_Urgency_One_Decision.png","15_Urgency_Procrastination_Cost.png",
    "16_Urgency_Snowball_Now.png","17_Urgency_Burning_Platform.png","18_Urgency_Time_Stamp.png",
    "19_Urgency_Seat_At_Table.png","20_Urgency_Last_Chance.png","21_Urgency_Domino_Effect.png",
    "22_Urgency_Midnight_Clock.png","23_Urgency_60_Day_Calendar.png","24_Urgency_Sunrise_Era.png",
    "25_Urgency_Pressure_Building.png","26_Urgency_Ship_Is_Sailing.png","27_Urgency_Window_Closing.png",
    "28_Urgency_Now_Or_Never.png","29_Urgency_Final_Warning.png","30_Urgency_Act_Today.png",
    "31_Urgency_Tomorrow_Too_Late.png","32_Urgency_Seconds_Count.png","33_Urgency_Momentum.png",
    "34_Urgency_Tipping_Point.png",
  ],
};

export interface CampaignSlot {
  category: string;
  utcHour: number;
  cronKey: string;
  ctaText: string;
  ctaUrl: string;
}

// 12 slots filling the 9 free hours + 3 shared-minute slots for 24 total posts/day
// Free hours: 1, 3, 5, 7, 9, 15, 19, 21, 23
// We also add :30 slots at 1:30, 3:30, 5:30 to reach 12 campaign slots
export const CAMPAIGN_SLOTS: CampaignSlot[] = [
  { category: "lifestyle",         utcHour: 1,  cronKey: "campaign:lifestyle",         ctaText: "Start earning today",     ctaUrl: "https://turboloop.tech/apply" },
  { category: "token",             utcHour: 3,  cronKey: "campaign:token",             ctaText: "View $TURBO token",       ctaUrl: "https://turboloop.tech/token" },
  { category: "referral",          utcHour: 5,  cronKey: "campaign:referral",          ctaText: "Build your network",      ctaUrl: "https://turboloop.tech/apply" },
  { category: "objection-handler", utcHour: 7,  cronKey: "campaign:objection",         ctaText: "Get the facts",           ctaUrl: "https://turboloop.tech/faq" },
  { category: "hindi-new",         utcHour: 9,  cronKey: "campaign:hindi",             ctaText: "अभी शुरू करें",           ctaUrl: "https://turboloop.tech/apply" },
  { category: "nigerian",          utcHour: 15, cronKey: "campaign:nigerian",          ctaText: "Start earning today",     ctaUrl: "https://turboloop.tech/apply" },
  { category: "success-story",     utcHour: 19, cronKey: "campaign:success",           ctaText: "Join them today",         ctaUrl: "https://turboloop.tech/apply" },
  { category: "education-defi",    utcHour: 21, cronKey: "campaign:education",         ctaText: "Learn DeFi basics",       ctaUrl: "https://turboloop.tech/learn" },
  { category: "urgency",           utcHour: 23, cronKey: "campaign:urgency",           ctaText: "Don't wait — start now",  ctaUrl: "https://turboloop.tech/apply" },
  { category: "buyback",           utcHour: 1,  cronKey: "campaign:buyback",           ctaText: "See the proof",           ctaUrl: "https://turboloop.tech/token" },
  { category: "comparison",        utcHour: 3,  cronKey: "campaign:comparison",        ctaText: "Compare for yourself",    ctaUrl: "https://turboloop.tech/calculator" },
  { category: "community",         utcHour: 5,  cronKey: "campaign:community",         ctaText: "Join the community",      ctaUrl: "https://t.me/turboloopofficial" },
];

// Pick today's image for a given category (deterministic, day-based rotation)
export function pickCampaignImage(category: string, dayIndex: number): { filename: string; url: string; caption: string; shareText: string } | null {
  const files = CAMPAIGN_FILES[category];
  if (!files || files.length === 0) return null;
  const filename = files[dayIndex % files.length];
  const key = `${category}/${filename}`;
  const copy = CAMPAIGN_COPY[key];
  return {
    filename,
    url: campaignImageUrl(category, filename),
    caption: copy?.caption ?? `Check out this TurboLoop ${category} update! 🚀\n\nEarn 0.9% daily returns with full capital back.\n\n🔗 turboloop.tech`,
    shareText: copy?.shareText ?? `Check out TurboLoop — earn 0.9% daily returns. turboloop.tech`,
  };
}
