# Polymarket Trading Bot Development Guide

**Objective:** Build automated bots to identify and exploit inefficiencies on Polymarket prediction markets, with proven profitability models ($23→$6,146 | $100→$8,000).

---

## 🎯 Proven Strategies

### Strategy 1: Weather Market Arbitrage (HIGH CONVICTION)
**Profile Evidence:** `0x594edB9112f526Fa6A80b8F858A6379C8A2c1C11` (+$47K in 3 months, 78% win rate)

**Core Mechanic:**
- NOAA publishes hyper-accurate 24-48hr weather forecasts (free, public data)
- Polymarket temperature markets are priced by retail traders (often wrong)
- **Exploit:** Buy buckets at 11¢ when NOAA shows 94% confidence → Sell at 45-60¢ (4x return)

**Example Inefficiency:**
```
NOAA: 94% confidence NYC hits 74-76°F Saturday
Polymarket: That bucket at 11¢
→ Buy at 0.11, sell at 0.45-0.60 = 4-5x ROI
```

**Key Metrics:**
- Entry threshold: **≤15¢** (only buy sub-15% buckets)
- Exit threshold: **45¢+** (sell on 3x minimum return)
- Win rate: **78%+**
- Position size: **$2 max per trade** (risk management)
- Scan frequency: **Every 2 minutes**
- Locations to monitor: NYC, Chicago, Seattle, Atlanta, Dallas, Miami

### Strategy 2: Combinatorial Arbitrage (ADVANCED)
**Profile Evidence:** `@k9Q2mX4L8A7ZP3R` (automated bot, $400K printed in 1 month)

**Core Mechanic:**
- Exploit YES+NO≠1 inefficiencies across outcome pairs
- Auto-detect marginal polytope projections mathematically
- Execute across non-atomic fills for tiny edges
- Compound 500+ trades/week at minimal margins

**Key Technical Components:**
- Marginal polytope projection solving (optimization)
- VWAP computation for execution windows
- Order book depth analysis
- Non-atomic fill detection
- Zero slippage tolerance enforcement

**Advantages:**
- No guesswork (purely mathematical)
- Small inefficiencies + high precision = compounding
- Scalable across all market pairs
- 500+ trades/week capability

---

## 🔧 Technical Stack

### Option A: No-Code (Fastest to Profits)
**Tool:** OpenClaw + Simmer Markets + Telegram

| Component | Purpose | Cost |
|-----------|---------|------|
| **OpenClaw** | AI agent framework (autonomous task execution) | Free |
| **Simmer Markets** | Pre-built trading skills (weather, copy, arbitrage) | Free |
| **Telegram Bot API** | Command & control interface | Free |
| **ChatGPT Plus** | AI brain for decision-making | $20/month |

**⏱️ Setup Time:** 30 minutes
**💪 Barrier:** Lowest - perfect for no-code traders
**🎯 Best For:** Weather market strategy (plug-and-play)

### Option B: Low-Code (More Control)
**Tools:** Polymarket CLI + Python/Rust client + Your orchestration

| Component | Language | Purpose |
|-----------|----------|---------|
| **py-clob-client** | Python | Direct orderbook access, built for bots |
| **rs-clob-client** | Rust | Same as above, optimized for low-latency |
| **polymarket-cli** | CLI | Terminal-based market viewing & order placement |
| **Smart Contracts** | Solidity | Direct CTF Exchange interaction |

**⏱️ Setup Time:** 2-4 hours
**💪 Barrier:** Medium - requires coding basics
**🎯 Best For:** Combinatorial arbitrage & custom strategies

### Option C: Full Stack (Maximum Customization)
**Tools:** Your TypeScript/Rust project + CTF Exchange contracts

**Stack:**
```typescript
├── Data Layer
│   ├── NOAA Weather API (weather strategy)
│   ├── Polymarket Gamma API (market data)
│   └── Subgraph queries (on-chain state)
│
├── Strategy Layer
│   ├── Weather arbitrage engine
│   ├── Polytope projection solver
│   ├── Order book analyzer
│   └── Spread detector
│
├── Execution Layer
│   ├── CLOB order submission
│   ├── Position manager
│   ├── Risk controls
│   └── Slippage protection
│
└── Monitoring Layer
    ├── P&L tracking
    ├── Trade logging
    ├── Alert system
    └── Analytics dashboard
```

**⏱️ Setup Time:** 1-2 weeks
**💪 Barrier:** High - requires deep understanding
**🎯 Best For:** Production systems, scaling to $100K+

---

## 📋 Implementation Guide

### 🚀 QUICK START: Weather Market Bot (OpenClaw + Simmer)

#### Step 1: Install OpenClaw
```bash
# macOS/Linux
curl -fsSL https://openclaw.ai/install.sh | bash

# Windows PowerShell
iwr -useb https://openclaw.ai/install.ps1 | iex

# Verify installation
openclaw --version
```

#### Step 2: Run Onboarding
```bash
openclaw onboard
```

**Selections to make:**
- Security warning → `Yes, I understand the risks`
- Onboarding mode → `Quick Start`
- Model provider → `OpenAI (Codex OAuth + API key)`
- Auth method → `ChatGPT OAuth`
- Model → `openai-codex/gpt-5.2`
- Communication → `Telegram (Bot API)`
- Node manager → `npm`

#### Step 3: Create Telegram Bot
```
1. Open Telegram → Search @BotFather
2. Send: /newbot
3. Follow prompts (name your bot, e.g., "PolyWeatherBot")
4. Copy the API token you receive
5. Paste into your OpenClaw terminal during setup
```

#### Step 4: Pair Your Bot
```bash
openclaw pairing approve telegram <YOUR_CODE_FROM_TELEGRAM>
```

Test in Telegram: Send `/start` → Bot should respond

#### Step 5: Set Up Simmer Markets
```
1. Go to https://simmer.markets
2. Connect your EVM wallet (Polygon recommended)
3. Copy your agent wallet address
4. Deposit $100 USDC or $POL to agent wallet
   (Start small for testing, scale once profitable)
```

#### Step 6: Link Bot to Simmer
In Telegram, send to your bot:
```
Read https://simmer.markets/skill.md and follow the instructions to join Simmer
```

Follow the Claim Agent link and confirm the transaction.

#### Step 7: Install Weather Trading Skill
```
1. Go to Simmer Markets → Skills tab
2. Find "Weather Trader"
3. Copy the install command
4. Send to Telegram bot:
   clawhub install simmer-weather
```

#### Step 8: Configure for Maximum Profitability
Send this exact config to your Telegram bot:

```
Config Weather Trader:
Entry threshold: 15%
Exit threshold: 45%
Max position size: $2.00
Locations: NYC, Chicago, Seattle, Atlanta, Dallas, Miami
Max trades per scan: 5
Safeguards: Enabled
Trend detection: Enabled
Scan frequency: every 2 minutes
```

**What each setting does:**
- **Entry 15%**: Only buy buckets priced ≤15¢ (high-confidence bets)
- **Exit 45%**: Sell when market corrects up (3x minimum profit)
- **$2 position**: Cap risk per trade (survive drawdowns)
- **6 cities**: Diversify across geographic regions
- **2-min scans**: Catch inefficiencies before market corrects
- **Safeguards**: Prevents panic selling in volatility

#### Step 9: Monitor & Optimize
Your bot is now live. It will:
- ✅ Pull NOAA forecasts every 2 minutes
- ✅ Scan all temperature buckets in 6 cities
- ✅ Buy underpriced outcomes automatically
- ✅ Sell when correction happens
- ✅ Report all trades in Telegram

**Expected Performance:**
- Win rate: 75-80%
- Avg trade return: 3-5x
- Monthly P&L: $2K-$5K per $100 deployed
- Zero manual intervention needed

---

### 🔬 ADVANCED: Combinatorial Arbitrage Bot (Python)

**Strategy:** Detect and exploit YES+NO≠1 inefficiencies

#### Architecture
```python
# core/strategies/arbitrage.py
class CombinatorialArbitrageBot:
    """
    Auto-detects YES/NO outcome pairs where prices don't sum to 1.
    Computes optimal polytope projections and VWAP execution.
    """
    
    def __init__(self):
        self.clob_client = PolymarketCLOB()
        self.data_cache = {}
        self.solver = PolytopeSolver()
        self.risk_mgr = RiskManager()
    
    def scan_markets(self, market_ids: List[str]) -> List[Opportunity]:
        """
        1. Fetch all outcomes + current prices
        2. Detect YES+NO != 1.0 spreads
        3. Compute marginal polytope projection
        4. Score by profit potential & risk
        5. Return top opportunities
        """
        
    def compute_vwap_execution(self, opportunity: Opportunity) -> ExecutionPlan:
        """
        VWAP = Volume Weighted Average Price
        Breaks large orders into small fills across time windows
        to minimize slippage and avoid detection
        """
        
    def execute_non_atomic_fill(self, plan: ExecutionPlan) -> Trade:
        """
        Non-atomic = order fills partially across multiple blocks
        Keeps order book depth clean, looks organic to market
        """
```

#### Key Algorithms
```python
# Marginal Polytope Projection
# Input: List of price points (outcome probabilities)
# Output: Optimal combination that exploits inefficiency

def marginal_polytope_projection(prices: np.array) -> np.array:
    """
    Solve: minimize ||x - p||^2
    Subject to: sum(x) = 1, x >= 0
    
    This finds the "closest fair price vector" and the gap
    between market prices and fair prices = arbitrage profit
    """
    A_eq = np.ones((1, len(prices)))
    b_eq = np.array([1.0])
    bounds = [(0, 1) for _ in prices]
    
    result = minimize(
        lambda x: np.linalg.norm(x - prices),
        x0=prices,
        constraints=[{'type': 'eq', 'fun': lambda x: x.sum() - 1.0}],
        bounds=bounds,
        method='SLSQP'
    )
    
    return result.x  # Fair prices

def detect_arbitrage_opportunity(market: Market) -> Optional[Trade]:
    """
    Step 1: Get current prices for all outcomes
    YES price: 0.65
    NO price: 0.42
    Sum = 1.07 (should be 1.00) → 7% inefficiency
    
    Step 2: Compute polytope projection
    Fair YES: 0.58
    Fair NO: 0.42
    
    Step 3: Execute
    Sell overpriced YES at 0.65, collect $65
    Buy underpriced NO at 0.42, spend $42
    Wait for convergence → collect $1 from both positions
    Profit = $65 - $42 - (transaction costs) = ~$20 on $40 capital
    """
```

#### Setup (Python)
```bash
# Install Polymarket client
pip install py-clob-client

# Install dependencies
pip install numpy scipy pandas asyncio aiohttp

# Create bot structure
mkdir -p polymarket-arb-bot/{core,strategies,utils,config}
touch polymarket-arb-bot/main.py
```

#### Core Bot Loop
```python
# main.py
import asyncio
from py_clob_client.client import PolymarketClient
from strategies.arbitrage import CombinatorialArbitrageBot

async def main():
    bot = CombinatorialArbitrageBot()
    
    while True:
        # 1. Scan all markets for inefficiencies
        opportunities = bot.scan_markets()
        
        # 2. Filter by profitability & risk
        qualified = [
            opp for opp in opportunities 
            if opp.roi > 0.05 and opp.capital_required < MAX_POSITION
        ]
        
        # 3. Execute top opportunities
        for opp in qualified[:5]:  # Max 5 concurrent trades
            plan = bot.compute_vwap_execution(opp)
            trade = bot.execute_non_atomic_fill(plan)
            bot.log_trade(trade)
        
        # 4. Sleep before next scan
        await asyncio.sleep(60)  # Scan every 60 seconds

if __name__ == "__main__":
    asyncio.run(main())
```

---

### ⚡ LOW-LATENCY: Rust CLOB Client (for speed freaks)

**When to use:** You're hitting >100 trades/week and latency matters

```bash
# Install rs-clob-client
cargo add rs_clob_client

# Example: Place order in <50ms
cargo run --example fast_order_placement
```

**Rust advantages:**
- Compile-time safety (no runtime surprises)
- Memory efficiency (lower infrastructure costs)
- Native async/await (handle 1000+ concurrent orders)
- Direct OrderBook access (skip REST API overhead)

```rust
// Fast order placement example
use rs_clob_client::Client;

#[tokio::main]
async fn main() {
    let client = Client::new().await;
    
    let order = client
        .place_order(MarketId::WEATHER_NYC, Side::BUY, 0.15, 100.0)
        .await?;
    
    println!("Order ID: {}", order.id);  // Often <50ms
}
```

---

## 📚 Resource Library

### Official Repositories
| Repo | Purpose | Language | Link |
|------|---------|----------|------|
| **py-clob-client** | Orderbook SDK | Python | `github.com/polymarket/py-clob-client` |
| **rs-clob-client** | Orderbook SDK | Rust | `github.com/polymarket/rs-clob-client` |
| **polymarket-cli** | Command line tool | Python/CLI | `github.com/polymarket/polymarket-cli` |
| **examples** | Code templates | Multi | `github.com/polymarket/examples` |
| **ctf-exchange** | Smart contracts | Solidity | `github.com/polymarket/ctf-exchange` |
| **PolyCop** | Copy trading bot | Python | `github.com/polymarket/polycop` |

### Data Sources
| Source | Data Type | Access | Cost |
|--------|-----------|--------|------|
| **NOAA API** | Weather forecasts | Public REST API | Free |
| **Polymarket Gamma API** | Market prices & volume | Public HTTP | Free |
| **Polymarket Subgraph** | On-chain positions | GraphQL | Free |
| **Telegram Bot API** | Alerts & control | Webhook | Free |
| **OpenClaw** | Autonomous agent | SDK | Free |

### Educational Resources
- **Weather Market Guide:** How weather data beats retail pricing
- **Polytope Projection:** Mathematical foundations for arbitrage
- **VWAP Execution:** Non-atomic fill strategies to minimize slippage
- **Risk Management:** Position sizing for <1% daily drawdown

---

## ✅ Validation Checklist

Before launching your bot, verify:

- [ ] Bot connects to correct market (mainnet Polymarket)
- [ ] Wallet funds confirmed in Simmer/custom setup
- [ ] Entry/exit thresholds tested in sandbox mode
- [ ] Position sizing doesn't exceed risk limits
- [ ] Slippage protection active (< X% tolerance)
- [ ] Monitoring alerts configured (Telegram/email)
- [ ] Profit/loss tracking enabled
- [ ] Kill switch ready (manual pause available)
- [ ] Ran 100 test trades with small positions
- [ ] Monitor first week intensively (daily reviews)

---

## 💡 Pro Tips for Maximum Profitability

### 1. Market Selection
✅ **DO:**
- Focus on high-volume markets (easier exits)
- Weather markets have structural inefficiencies (retail pricing)
- Binary outcomes are easier to analyze than multi-way

❌ **DON'T:**
- Trade low-liquidity markets (slippage kills ROI)
- Copy trades blindly (spreads + illiquidity = losses)
- Trade during major economic events (volatility destroys edge)

### 2. Risk Management
```
Position Sizing Rule (Kelly Criterion adjusted):
Position size = (Win Rate % - Loss Rate %) / (Avg Win / Avg Loss)

Example for 78% win rate, 3x avg return:
= (0.78 - 0.22) / 3 = ~19% of capital per trade
→ But cap at 2-5% for safety
```

### 3. Entry/Exit Discipline
- **Entry:** Only when NOAA confidence > market price + 30% gap
  - Example: NOAA 90%, market 11¢ → ENTER
  - Example: NOAA 75%, market 60¢ → SKIP
  
- **Exit:** Automatic at 3x minimum, or 48hr before expiry
  - Don't hold to expiry (execution risk)
  - Lock profits early and move to next trade

### 4. Monitoring & Optimization
Weekly review metrics:
```
- Win rate % (target: 75%+)
- Avg trade return (target: 3-5x)
- Max drawdown (keep < 20%)
- Capital efficiency (target: $1K → $2K/month)
- Scan coverage (all top cities covered?)
```

Monthly optimization:
- Add new markets if profitable
- Remove markets with >2% slippage
- Adjust entry threshold if skipping winners
- Backtest config changes on historical data

---

## 🚨 Common Pitfalls to Avoid

| Mistake | Why It Kills Profits | Solution |
|---------|--------------------|------------|
| Copy-trading whale positions | Spreads + illiquidity destroy entry | Only trade high-volume buckets |
| Buying penny stocks (ultra-low prices) | 1000x returns need perfect conditions | Max 20% of portfolio in <2¢ buckets |
| Manual monitoring | FOMO + emotions override logic | Fully automate with hardcoded rules |
| Wrong API key scope | Locked into read-only, can't trade | Double-check write permissions |
| Ignoring slippage | Small cost × 500 trades = huge P&L hit | Set strict slippage caps |
| Forgetting to diversify | Single market blowup = months of gains lost | Min 5-10 concurrent positions |

---

## 🎯 Success Metrics

By month 3, you should see:

```
✅ P&L Goal: $500-$2,000 (on $100 initial deployment)
✅ Win Rate: 75%+
✅ Max Drawdown: <20%
✅ Trades/week: 50-200 (weather) or 500+ (arb)
✅ Time to profitability: <1 week (weather) or 2-3 weeks (arb)
```

If you're not seeing this, revisit:
1. Market selection (wrong markets = no edge)
2. Entry thresholds (too strict = missing winners)
3. Data quality (stale NOAA forecasts = bad entries)
4. Execution speed (slow fills = poor exits)

---

## 🔗 Quick Links

**Official Documentation:**
- Polymarket: https://docs.polymarket.com
- CTF Exchange Contracts: https://github.com/polymarket/ctf-exchange
- NOAA API: https://api.weather.gov

**Community & Tools:**
- OpenClaw: https://openclaw.ai
- Simmer Markets: https://simmer.markets
- Polymarket GitHub: https://github.com/polymarket

**Proven Strategies (Live Examples):**
- Weather bot ($47K+ earned): `0x594edB9112f526Fa6A80b8F858A6379C8A2c1C11`
- Arb bot ($400K earned): `@k9Q2mX4L8A7ZP3R`
- Copy bot ($72K earned): `automatedAItradingbot`

**Stack Exchange:**
- Use `py-clob-client` for Python-first development
- Use `rs-clob-client` for speed/latency-critical systems
- Use OpenClaw+Simmer for zero-code rapid prototyping

---

## 📝 Implementation Roadmap

```
Week 1: Deploy Weather Bot (No-Code)
├─ Install OpenClaw + Simmer
├─ Configure for 6 US cities
├─ Deploy with $100 test capital
└─ Monitor for win rate >70%

Week 2-3: Optimize Weather Bot
├─ Analyze trade data
├─ Fine-tune entry/exit thresholds
├─ Add additional cities if profitable
└─ Scale capital to $1K

Week 4+: Combinatorial Arbitrage (Advanced)
├─ Deploy py-clob-client for arb detection
├─ Implement polytope projection solver
├─ Execute 500+ trades/week model
└─ Target $2K-$5K/month P&L
```

---

**TL;DR: Start with weather markets + OpenClaw. $100 → $8,000 in 3 months is achievable with discipline and automated execution. No coding required. Just mathematical edge + patience.**
