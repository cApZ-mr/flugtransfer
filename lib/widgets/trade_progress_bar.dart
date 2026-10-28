import 'package:flutter/material.dart';
import '../models/market_listing.dart';

class TradeProgressBar extends StatelessWidget {
  final TradeStatus status;

  const TradeProgressBar({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    int activeIndex = 0;
    if (status == TradeStatus.open) activeIndex = 0;
    if (status == TradeStatus.inNegotiation) activeIndex = 1;
    if (status == TradeStatus.completed) activeIndex = 2;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        border: Border.all(color: const Color(0xFF1E293B)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildStep('1. Offen', activeIndex >= 0, activeIndex == 0),
          _buildConnector(activeIndex >= 1),
          _buildStep('2. In Verhandlung', activeIndex >= 1, activeIndex == 1),
          _buildConnector(activeIndex >= 2),
          _buildStep('3. Abgegeben', activeIndex >= 2, activeIndex == 2),
        ],
      ),
    );
  }

  Widget _buildStep(String label, bool isDone, bool isCurrent) {
    Color color;
    if (isCurrent) {
      color = const Color(0xFF38BDF8);
    } else if (isDone) {
      color = const Color(0xFF10B981);
    } else {
      color = const Color(0xFF64748B);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          isDone ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 14,
          color: color,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildConnector(bool active) {
    return Expanded(
      child: Container(
        height: 2,
        color: active ? const Color(0xFF10B981) : const Color(0xFF1E293B),
        margin: const EdgeInsets.symmetric(horizontal: 6),
      ),
    );
  }
}
