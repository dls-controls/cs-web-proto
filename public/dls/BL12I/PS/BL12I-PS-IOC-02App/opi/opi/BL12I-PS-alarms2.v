$table.parse("BL12I-PS-alarms2.csv")
#set($dom = "BL12I")
#set($nSerial = 5)
#set($nParIlk = 0)
#set($nParLop = -1)
#set($splitRowId = 6)
#set($title = "PSS - BL12I: ALARMS CRATE 2")
#parse("pss_include.v")
