import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/swap_negotiation.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';
import 'chat_room_screen.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final negotiations = roster.negotiations;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Chats & Verhandlungen',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: negotiations.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.forum_outlined, size: 40, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Noch keine aktiven Chats',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Klicke in der Börse auf „Verhandeln”, um einen Chat zu eröffnen.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                ],
              ),
            )
          : ListView.separated(
              itemCount: negotiations.length,
              separatorBuilder: (context, index) => const Divider(
                color: Color(0xFF1E293B),
                height: 1,
                indent: 72,
              ),
              itemBuilder: (context, index) {
                final neg = negotiations[index];
                return _buildConversationTile(context, roster, neg);
              },
            ),
    );
  }

  Widget _buildConversationTile(BuildContext context, RosterProvider roster, SwapNegotiation neg) {
    final lastMsg = neg.messages.isNotEmpty ? neg.messages.last : null;
    final timeStr = lastMsg != null ? DateFormat('HH:mm').format(lastMsg.timestamp) : '';

    Color statusColor;
    switch (neg.status) {
      case TradeStatus.open:
        statusColor = const Color(0xFF34D399);
        break;
      case TradeStatus.inNegotiation:
        statusColor = const Color(0xFFFBBF24);
        break;
      case TradeStatus.completed:
        statusColor = const Color(0xFF94A3B8);
        break;
    }

    return InkWell(
      onTap: () {
        roster.selectChat(neg.id);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ChatRoomScreen(negotiationId: neg.id),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Avatar with online dot
            Stack(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: const Color(0xFF0284C7).withOpacity(0.2),
                  child: Text(
                    neg.colleagueName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').take(2).join(),
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF38BDF8), fontSize: 14),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF090D16), width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        neg.colleagueName,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      Text(
                        timeStr,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          neg.shift.flightNumber,
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          neg.status.label,
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    lastMsg?.text ?? 'Keine Nachrichten',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: lastMsg != null && !lastMsg.isMe ? const Color(0xFFE2E8F0) : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
