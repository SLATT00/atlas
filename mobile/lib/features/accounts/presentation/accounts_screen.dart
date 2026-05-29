import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class AccountsScreen extends StatelessWidget {
  const AccountsScreen({super.key});

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
                    Text('Счета', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 4),
                    const Text('Всего: ₽9 620 000', style: TextStyle(color: AtlasColors.textSecondary, fontSize: 14)),
                  ],
                ),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Открыть'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _accountCard('🇷🇺', 'RUB счёт', '4081 7810 0000 1234', '₽8 450 000'),
            _accountCard('🇺🇸', 'USD счёт', '4081 7840 0000 5678', '\$12 500'),
            _accountCard('🇪🇺', 'EUR счёт', '4081 7978 0000 9012', '€8 200'),
            _accountCard('🇦🇪', 'AED счёт', '4081 7840 0000 3456', 'د.إ45 000'),
          ],
        ),
      ),
    );
  }

  Widget _accountCard(String flag, String name, String number, String balance) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: AtlasColors.elevated, shape: BoxShape.circle),
              alignment: Alignment.center,
              child: Text(flag, style: const TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
                  const SizedBox(height: 2),
                  Text(number, style: const TextStyle(fontSize: 12, color: AtlasColors.muted)),
                ],
              ),
            ),
            Text(balance, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AtlasColors.text)),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: AtlasColors.muted, size: 20),
          ],
        ),
      ),
    );
  }
}
