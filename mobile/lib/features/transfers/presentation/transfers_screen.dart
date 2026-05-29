import 'package:flutter/material.dart';
import '../../../core/theme/atlas_theme.dart';

class TransfersScreen extends StatelessWidget {
  const TransfersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Переводы', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 20),
            _transferTypeChips(),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(decoration: const InputDecoration(labelText: 'Получатель', hintText: 'Имя, телефон или реквизиты')),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: TextField(decoration: const InputDecoration(labelText: 'Сумма', hintText: '0.00'), keyboardType: TextInputType.number)),
                        const SizedBox(width: 12),
                        Expanded(child: TextField(decoration: const InputDecoration(labelText: 'Валюта', hintText: 'RUB'))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(decoration: const InputDecoration(labelText: 'Описание', hintText: 'Необязательно')),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Комиссия', style: TextStyle(color: AtlasColors.textSecondary)),
                        const Text('0 ₽', style: TextStyle(color: AtlasColors.text, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () {}, child: const Text('Отправить'))),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('История', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            _historyItem('Алексей Петров', '-₽25 000', 'Выполнен', true),
            _historyItem('John Smith (SWIFT)', '-\$1 500', 'В обработке', false),
            _historyItem('0x1a2b...9f8e', '-0.5 ETH', 'Выполнен', true),
          ],
        ),
      ),
    );
  }

  Widget _transferTypeChips() {
    final types = ['Внутренний', 'По стране', 'Международный', 'На карту', 'Крипто'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: types.map((t) => Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Chip(
            label: Text(t, style: const TextStyle(fontSize: 13)),
            backgroundColor: t == 'Внутренний' ? AtlasColors.accent.withOpacity(0.15) : AtlasColors.card,
            side: BorderSide(color: t == 'Внутренний' ? AtlasColors.accent.withOpacity(0.3) : Colors.white.withOpacity(0.1)),
          ),
        )).toList(),
      ),
    );
  }

  Widget _historyItem(String name, String amount, String status, bool completed) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: AtlasColors.card, shape: BoxShape.circle, border: Border.all(color: Colors.white.withOpacity(0.1))),
            child: Icon(completed ? Icons.check_circle_outline : Icons.access_time, size: 16, color: completed ? AtlasColors.success : AtlasColors.warning),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontSize: 14, color: AtlasColors.text)),
              Text(status, style: TextStyle(fontSize: 11, color: completed ? AtlasColors.success : AtlasColors.warning)),
            ],
          )),
          Text(amount, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AtlasColors.text)),
        ],
      ),
    );
  }
}
