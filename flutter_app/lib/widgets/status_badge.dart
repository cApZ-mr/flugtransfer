import 'package:flutter/material.dart';
import '../models/market_listing.dart';

class StatusBadge extends StatelessWidget {
  final TradeStatus status;
  final bool showDot;

  const StatusBadge({
    super.key,
    required this.status,
    this.showDot = true,
  });

  @override
  Widget build(BuildContext context) {
    Color textColor;
    Color bgColor;
    Color borderColor;

    switch (status) {
      case TradeStatus.open:
        textColor = const Color(0xFF34D399); // Emerald
        bgColor = const Color(0xFF065F46).withOpacity(0.25);
        borderColor = const Color(0xFF10B981).withOpacity(0.4);
        break;
      case TradeStatus.inNegotiation:
        textColor = const Color(0xFFFBBF24); // Amber
        bgColor = const Color(0xFF78350F).withOpacity(0.25);
        borderColor = const Color(0xFFF59E0B).withOpacity(0.4);
        break;
      case TradeStatus.completed:
        textColor = const Color(0xFF94A3B8); // Slate
        bgColor = const Color(0xFF334155).withOpacity(0.25);
        borderColor = const Color(0xFF64748B).withOpacity(0.4);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: textColor, shape: BoxShape.circle),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            status.label,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textColor),
          ),
        ],
      ),
    );
  }
}
