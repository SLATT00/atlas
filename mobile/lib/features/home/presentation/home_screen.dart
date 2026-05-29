import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text('Общий капитал', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 4),
            Text('₽12 450 000', style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 4),
            const Text('+2.3% за месяц', style: TextStyle(color: AtlasColors.success, fontSize: 14, fontWeight: FontWeight.w500)),
            const SizedBox(height: 24),
            _buildAssetBar(),
            const SizedBox(height: 24),
            _buildQuickActions(context),
            const SizedBox(height: 24),
            Text('Последние операции', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            _buildTransactionItem('Перевод Алексею', '-₽25 000', false),
            _buildTransactionItem('Зарплата', '+₽450 000', true),
            _buildTransactionItem('Netflix', '-₽999', false),
            _buildTransactionItem('BTC → RUB', '+₽180 000', true),
            _buildTransactionItem('Яндекс.Еда', '-₽2 350', false),
          ],
        ),
      ),
    );
  }

  Widget _buildAssetBar() {
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: Row(
            children: [
              Expanded(flex: 68, child: Container(height: 8, color: AtlasColors.accent)),
              Expanded(flex: 22, child: Container(height: 8, color: Colors.purple)),
              Expanded(flex: 8, child: Container(height: 8, color: AtlasColors.success)),
              Expanded(flex: 2, child: Container(height: 8, color: AtlasColors.warning)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _assetLabel(AtlasColors.accent, 'Фиат', '68%'),
            _assetLabel(Colors.purple, 'Крипто', '22%'),
            _assetLabel(AtlasColors.success, 'Накопления', '8%'),
            _assetLabel(AtlasColors.warning, 'Инвестиции', '2%'),
          ],
        ),
      ],
    );
  }

  Widget _assetLabel(Color color, String label, String percent) {
    return Expanded(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 4),
          Flexible(child: Text('$label $percent', style: const TextStyle(fontSize: 11, color: AtlasColors.textSecondary), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      (Icons.add, 'Пополнить', AtlasColors.success),
      (Icons.arrow_upward, 'Перевести', AtlasColors.accent),
      (Icons.swap_horiz, 'Обменять', AtlasColors.warning),
      (Icons.credit_card, 'Карта', AtlasColors.text),
      (Icons.account_balance, 'Займ', Colors.purple),
      (Icons.description, 'Реквизиты', AtlasColors.textSecondary),
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: actions.map((a) => _quickAction(a.$1, a.$2, a.$3)).toList(),
    );
  }

  Widget _quickAction(IconData icon, String label, Color color) {
    return Column(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AtlasColors.card,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: Icon(icon, size: 20, color: color),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 11, color: AtlasColors.textSecondary)),
      ],
    );
  }

  Widget _buildTransactionItem(String title, String amount, bool positive) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AtlasColors.card,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Icon(
              positive ? Icons.add : Icons.arrow_upward,
              size: 16,
              color: positive ? AtlasColors.success : AtlasColors.textSecondary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(fontSize: 14, color: AtlasColors.text))),
          Text(amount, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: positive ? AtlasColors.success : AtlasColors.text)),
        ],
      ),
    );
  }
}
