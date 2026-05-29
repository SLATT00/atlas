import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Продукты', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            Row(
              children: [
                const Icon(Icons.trending_up, color: AtlasColors.success, size: 20),
                const SizedBox(width: 8),
                Text('Накопления', style: Theme.of(context).textTheme.headlineSmall),
              ],
            ),
            const SizedBox(height: 12),
            _savingsCard('RUB Вклад', '₽500 000', '18.5%', '₽253/день'),
            _savingsCard('USD Вклад', '\$5 000', '5.2%', '\$0.71/день'),
            _savingsCard('USDT Стейкинг', '₮10 000', '8.0%', '₮2.19/день'),
            const SizedBox(height: 24),
            Row(
              children: [
                const Icon(Icons.account_balance, color: Colors.purple, size: 20),
                const SizedBox(width: 8),
                Text('Займы', style: Theme.of(context).textTheme.headlineSmall),
              ],
            ),
            const SizedBox(height: 12),
            _loanCard('BTC', '₽2 000 000', '45%', '12.5%'),
            _loanCard('ETH', '₽500 000', '52%', '13.0%'),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Доступный кредит', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                        const SizedBox(height: 4),
                        const Text('₽5 000 000', style: TextStyle(color: AtlasColors.text, fontSize: 20, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    ElevatedButton(onPressed: () {}, child: const Text('Получить')),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _savingsCard(String name, String balance, String apy, String daily) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                const SizedBox(height: 2),
                Text('APY: $apy', style: const TextStyle(fontSize: 12, color: AtlasColors.success)),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(balance, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                const SizedBox(height: 2),
                Text('+$daily', style: const TextStyle(fontSize: 11, color: AtlasColors.success)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _loanCard(String collateral, String amount, String ltv, String rate) {
    final ltvNum = int.parse(ltv.replaceAll('%', ''));
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Text('Залог: $collateral', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: (ltvNum < 50 ? AtlasColors.success : AtlasColors.warning).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text('LTV $ltv', style: TextStyle(fontSize: 11, color: ltvNum < 50 ? AtlasColors.success : AtlasColors.warning)),
                  ),
                ]),
                const SizedBox(height: 2),
                Text('Ставка: $rate', style: const TextStyle(fontSize: 12, color: AtlasColors.muted)),
              ],
            ),
            Text(amount, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
          ],
        ),
      ),
    );
  }
}
