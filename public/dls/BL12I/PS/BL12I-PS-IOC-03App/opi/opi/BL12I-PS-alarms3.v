$table.parse("BL12I-PS-alarms3.csv")
#set($dom = "BL12I")
#set($nSerial = 5)
#set($nParIlk = 0)
#set($nParLop = -1)
#set($splitRowId = 8)
#set($title = "PSS - BL12I: ALARMS CRATE 3")
#parse("pss_include.v")
