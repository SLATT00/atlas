import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class WalletsScreen extends StatelessWidget {
  const WalletsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Кошельки', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 4),
                    const Text('₽6 721 000', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                  ],
                ),
                OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.add, size: 16), label: const Text('Добавить')),
              ],
            ),
            const SizedBox(height: 20),
            _walletCard('₿', 'BTC', 'Bitcoin', '0.4521', '+2.4%', true),
            _walletCard('Ξ', 'ETH', 'Ethereum', '3.2', '-1.2%', false),
            _walletCard('◎', 'TON', 'Toncoin', '1 500', '+5.1%', true),
            _walletCard('◎', 'SOL', 'Solana', '25', '+3.8%', true),
            _walletCard('₮', 'USDT', 'Tether', '5 000', '+0.01%', true),
            _walletCard('\$', 'USDC', 'USD Coin', '3 000', '-0.02%', false),
          ],
        ),
      ),
    );
  }

  Widget _walletCard(String icon, String code, String name, String balance, String change, bool positive) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: AtlasColors.elevated, shape: BoxShape.circle),
              alignment: Alignment.center,
              child: Text(icon, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AtlasColors.accent)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Text(code, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                    const SizedBox(width: 6),
                    Text(name, style: const TextStyle(fontSize: 12, color: AtlasColors.muted)),
                  ]),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('$balance $code', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                const SizedBox(height: 2),
                Text(change, style: TextStyle(fontSize: 11, color: positive ? AtlasColors.success : AtlasColors.error)),
              ],
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: AtlasColors.muted, size: 20),
          ],
        ),
      ),
    );
  }
}
