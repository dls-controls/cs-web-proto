$table.parse("BL15I-PS-alarms.csv")
#set($dom = "BL15I")
#set($nSerial = 5)
#set($nParIlk = 0)
#set($nParLop = -1)
#set($splitRowId = 8)
#set($title = "PSS - BL15I: ALARMS")
#parse("pss_include.v")
