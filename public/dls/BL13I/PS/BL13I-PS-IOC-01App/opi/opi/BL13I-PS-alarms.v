$table.parse("BL13I-PS-alarms.csv")
#set($dom = "BL13I")
#set($nSerial = 5)
#set($nParIlk = 0)
#set($nParLop = -1)
#set($splitRowId = 8)
#set($title = "PSS - BL13I: ALARMS")
#parse("pss_include.v")
