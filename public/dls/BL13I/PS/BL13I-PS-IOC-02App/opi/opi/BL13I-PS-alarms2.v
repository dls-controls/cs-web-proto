$table.parse("BL13I-PS-alarms2.csv")
#set($dom = "BL13I")
#set($nSerial = 5)
#set($nParIlk = 0)
#set($nParLop = -1)
#set($splitRowId = 8)
#set($title = "PSS - BL13I: ALARMS CRATE 2")
#parse("pss_include.v")
