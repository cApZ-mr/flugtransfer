import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/swap_negotiation.dart';
import '../models/market_listing.dart';
import '../services/roster_provider.dart';

class ChatRoomScreen extends StatefulWidget {
  final String negotiationId;
  const ChatRoomScreen({super.key, required this.negotiationId});

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final roster = context.watch<RosterProvider>();
    final neg = roster.negotiations.firstWhere(
      (n) => n.id == widget.negotiationId,
      orElse: () => throw Exception('Negotiation not found'),
    );

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

    _scrollToBottom();

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Zurück zur Übersicht',
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFF0284C7).withOpacity(0.2),
              child: Text(
                neg.colleagueName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').take(2).join(),
                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF38BDF8), fontSize: 12),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    neg.colleagueName,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    '${neg.colleagueRole} • Base ${neg.colleagueBase}',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withOpacity(0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                ),
                const SizedBox(width: 5),
                Text(
                  neg.status.label,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Shift Information Ribbon
          _buildShiftHeaderRibbon(neg),

          // 3-Step Negotiation Progress Tracker
          _buildStatusProgressTracker(neg),

          // WhatsApp Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: neg.messages.length,
              itemBuilder: (context, index) {
                final msg = neg.messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          // "Tausch ist durch?" Agreement Box
          if (neg.status != TradeStatus.completed)
            _buildConfirmationBanner(context, roster, neg)
          else
            _buildCompletedBanner(neg),

          // WhatsApp Bottom Input Bar
          _buildInputBar(roster, neg),
        ],
      ),
    );
  }

  Widget _buildShiftHeaderRibbon(SwapNegotiation neg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Color(0xFF131D31),
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.flight_takeoff, size: 16, color: Color(0xFF38BDF8)),
              const SizedBox(width: 8),
              Text(
                '${neg.shift.flightNumber} (${neg.shift.routeFormatted})',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
              ),
            ],
          ),
          Text(
            neg.shift.formattedDate,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusProgressTracker(SwapNegotiation neg) {
    int activeStep = 1;
    if (neg.status == TradeStatus.open) activeStep = 0;
    if (neg.status == TradeStatus.inNegotiation) activeStep = 1;
    if (neg.status == TradeStatus.completed) activeStep = 2;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      color: const Color(0xFF0F172A),
      child: Row(
        children: [
          _buildStepItem('1. Offen', activeStep >= 0, activeStep == 0),
          _buildStepConnector(activeStep >= 1),
          _buildStepItem('2. In Verhandlung', activeStep >= 1, activeStep == 1),
          _buildStepConnector(activeStep >= 2),
          _buildStepItem('3. Abgegeben', activeStep >= 2, activeStep == 2),
        ],
      ),
    );
  }

  Widget _buildStepItem(String title, bool isCompleted, bool isCurrent) {
    final color = isCurrent
        ? const Color(0xFF38BDF8)
        : (isCompleted ? const Color(0xFF10B981) : const Color(0xFF64748B));

    return Row(
      children: [
        Icon(
          isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 14,
          color: color,
        ),
        const SizedBox(width: 4),
        Text(
          title,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildStepConnector(bool isActive) {
    return Expanded(
      child: Container(
        height: 1,
        color: isActive ? const Color(0xFF10B981) : const Color(0xFF1E293B),
        margin: const EdgeInsets.symmetric(horizontal: 6),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    if (msg.isSystem) {
      return Center(
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Text(
            msg.text,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
          ),
        ),
      );
    }

    final isMe = msg.isMe;
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFF005C4B) : const Color(0xFF1F2C34),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomLeft: isMe ? const Radius.circular(12) : const Radius.circular(0),
            bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(12),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              msg.text,
              style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.3),
            ),
            const SizedBox(height: 3),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat('HH:mm').format(msg.timestamp),
                  style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.done_all, size: 14, color: Color(0xFF38BDF8)),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConfirmationBanner(BuildContext context, RosterProvider roster, SwapNegotiation neg) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF0284C7).withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.handshake_outlined, color: Color(0xFF38BDF8), size: 18),
              SizedBox(width: 8),
              Text(
                'Tausch-Vereinbarung abschließen',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Seid ihr euch einig? Wenn du bestätigst, wird der Tausch vollzogen und die Schicht automatisch in deinen Dienstplan übernommen.',
            style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), height: 1.3),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                roster.confirmTradeStep(neg.id);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Tausch vollzogen! Schicht ${neg.shift.flightNumber} ist in deinem Dienstplan.'),
                    backgroundColor: const Color(0xFF10B981),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: BorderRadius.circular(8),
              ),
              icon: const Icon(Icons.check, size: 16),
              label: const Text('Tausch ist durch? Jetzt bestätigen', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompletedBanner(SwapNegotiation neg) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF065F46).withOpacity(0.3),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5)),
      ),
      child: Row(
        children: const [
          Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Tausch erfolgreich abgeschlossen! Schicht im Dienstplan aktualisiert.',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF6EE7B7)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(RosterProvider roster, SwapNegotiation neg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: const Color(0xFF0F172A),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Nachricht eingeben...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
              ),
              onSubmitted: (text) {
                if (text.trim().isNotEmpty) {
                  roster.sendMessage(neg.id, text);
                  _messageController.clear();
                }
              },
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: const Color(0xFF0284C7),
            radius: 20,
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.white, size: 18),
              onPressed: () {
                if (_messageController.text.trim().isNotEmpty) {
                  roster.sendMessage(neg.id, _messageController.text);
                  _messageController.clear();
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}
