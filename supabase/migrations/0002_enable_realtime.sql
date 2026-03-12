-- Enable Supabase Realtime for messages and approvals tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
